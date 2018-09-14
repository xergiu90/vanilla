let apiBase= "https://api.themoviedb.org/3/";
const apiToken= "?api_key=85f555bee0c3cd97f66c454b7936d2f0&language=en-US";
let genrePath= "genre/movie/list";
let nowPlayingMoviesPath= "movie/now_playing";
let filePathImages= "https://image.tmdb.org/t/p/original/";

let nowPlayingMovies= apiBase + nowPlayingMoviesPath + apiToken;
let moviesByGenre= apiBase + genrePath + apiToken;

let moviesObject;



//the application start point - gets the movie genres
fetch(moviesByGenre, { headers: { "Content-Type": "application/json; charset=utf-8" }})
    .then(res => res.json())
    .then(response => {

        getMoviesData(response.genres);

    })
    .catch(err => {
        console.log(err)
    });

//here we get the movie details and generates the movie objects
let getMoviesData = (genreTypes) => {
    fetch(nowPlayingMovies, {headers: {"Content-Type": "application/json; charset=utf-8"}})
        .then(res => res.json())
        .then(response => {
            moviesObject = response.results;

            moviesObject.forEach(v => {
                let imageUrl = filePathImages + v.poster_path;
                //we call a function to find out all the genres a movie has based on the id
                let movieGenre= getMovieGenre(v, genreTypes);

                const markup = `
                <div class="movie" id="movie-${v.id}"> 
                    <div class="movie-poster">  <img class="movie-poster" src="${imageUrl}" /></div>
                    <div class="movie-details">
                        <div class="movie-title">${v.title}</div>
                        <div id="gendre">Genre: <i>${movieGenre}</i></div>
                    </div>
                </div>
                `;

                document.getElementById("movie-list").innerHTML += markup;

            });

            //here we add events to the sort options
            showOptions(moviesObject);

            //here we generate the genre types for the filters
            getGenreTypes(moviesObject, genreTypes);

            //here we generate the rating stars
            getStarRating(moviesObject);

        })
        .catch(err => {
            console.log(err)
        });

};

//here we asociate the movie genre ids with the genre names
let getMovieGenre = (v, genreTypes) => {
    let movieGenre="";
    v.genreTypes=[];
    v.genre_ids.forEach(s => {
        genreTypes.find(function (obj) { if (obj.id === s) {
            v.genreTypes.push(obj.name);
            movieGenre += obj.name+ " ";
        }});

    });

    return movieGenre;
};

//here we add events to the top sort by options
let showOptions = (movieList) => {
    const optionsSelect = [...document.getElementsByClassName('sort')];
    optionsSelect.forEach(s=>{
        s.addEventListener('click', function(e){
            if(s.classList.contains('show')) {
                //here we show the sub options for ratings and for genre filters
                showSubOptions(s);
                e.target.classList.add('active');
                optionsSelect.forEach(p => {
                    p.classList.remove('show');
                });
                if(e.target.classList.contains('rating')) {
                    //we trigger the filter movie to start at 3 stars
                    showFilteredMovies(movieList, false, 6);
                } else {
                    //we trigger the filter movie to start at 0 stars so all the movies are shown
                    showFilteredMovies(movieList, false, 1);
                }
            } else {
                optionsSelect.forEach(p => {
                    p.classList.add('show');
                });
                s.classList.remove('active');
            }
        });
    });
};

//show the suboptions for the genre and star rating
let showSubOptions = (s) => {
    if (s.classList.contains('rating')) {
        document.getElementById('star-rating').classList.add('show');
        document.getElementById('genres').classList.remove('show');
    } else if (s.classList.contains('genre')) {
        document.getElementById('genres').classList.add('show');
        document.getElementById('star-rating').classList.remove('show');
    } else {
        document.getElementById('star-rating').classList.remove('show');
        document.getElementById('genres').classList.remove('show');
    }
};

//this generates the genre checkboxes for the genre filter
let getGenreTypes = (movieList ,genres) => {
    genres.forEach(s=> {
        let genreCheckbox = `<div class="genre-checkbox">
                    <input type="checkbox" name="${s.name}" value="${s.name}" class="genre-input">
                    <label for="${s.name}">${s.name}</label>
                </div>
                `;
        document.getElementById("genres").innerHTML += genreCheckbox;
    });

    //take all checkboxes and generate event listiners for adding and removing the checked class
    const genreCheckSelect = [...document.getElementsByClassName('genre-input')];

    genreCheckSelect.forEach(s => {
        s.addEventListener('click', function(e){
            if(e.target.classList.contains('checked')) {
                e.target.classList.remove('checked');
                //call function for removing checking
                showChecked(movieList, genreCheckSelect);
            } else {
                //call function for adding check box
                e.target.classList.add('checked');
                showChecked(movieList, genreCheckSelect);
            }
        });
    });
};

//this takes all the checked genres and returns them
let showChecked = (movieList, genreCheckSelect) => {
    let genresPresent=[];
    genreCheckSelect.forEach(o => {
        if(o.classList.contains('checked')) {
            genresPresent.push(o.value);
        }
    });

    //apply the genre filters
    showFilteredMovies(movieList, genresPresent);
};

//apply the filters depending if you are in the genre or star sort options
let showFilteredMovies = (movieList, genre, star) => {
    if(genre.length!=0 && genre) {
        movieList.forEach(o => {
            let show=0;
            for(let i=0; i<genre.length; i++) {
                if(o.genreTypes.some(r=> genre[i].indexOf(r) >= 0)) {
                    show=1;
                } else {
                    show=0;
                    break;
                }
            }
            if (!show) {
                document.getElementById('movie-'+o.id).classList.add('hide');
                return false;
            } else {
                document.getElementById('movie-'+o.id).classList.remove('hide');
            }
        });
    } else if (star) {
        console.log(movieList);
        movieList.forEach(p => {
            if(p.vote_average<=star/2) {
                document.getElementById('movie-'+p.id).classList.add('hide');
            } else {
                document.getElementById('movie-'+p.id).classList.remove('hide');
            }
        });
    } else {
        //reset view if you exit genre or star
        movieList.forEach(m => {
            document.getElementById('movie-'+m.id).classList.remove('hide');
        });
    }
};

//here we generate the star rating and add events to the stars
let getStarRating = (movieList) => {
    for (let i=1; i<=20; i++){
        let star = `
                <span class="star fa fa-star-half ${(i<=6)?"checked":""} ${(i%2==0)?"right":"left"}"></span>
                `;
        document.getElementById("star-rating").innerHTML +=star;
    }

    const starSelect = [...document.getElementsByClassName('star')];

    //add events for the actions on the stars
    starSelect.forEach(s=>{
        s.addEventListener('click', function(e){
            let starClicked= e.target;
            starClicked.classList.add('checked');
            addClassOfSiblings(starClicked, false, 0, movieList);
            removeClassOfSiblings(starClicked);
        });
        s.addEventListener('mouseenter', function(e){
            let starClicked= e.target;
            starClicked.classList.add('hover');
            //call classes to remove and to add hover effect for all siblings
            addClassOfSiblings(starClicked, true,0 , movieList);
            removeClassOfSiblings(starClicked);
        });

        s.addEventListener('mouseleave', function(e){
            let starClicked= e.target;
            starClicked.classList.remove('hover');
            removeClassOfSiblings(starClicked, true);
        });
    });
};

//add hover class to all previous siblings until the first sibling(called recursevly)
let addClassOfSiblings = (el, hover, num, movieList) =>  {
    if(hover) {
        if (el.previousElementSibling == null) {
            return;
        }
        el.previousElementSibling.classList.add('hover');
        addClassOfSiblings(el.previousElementSibling, true );
    } else {
        num++;
        if (el.previousElementSibling == null) {
            showFilteredMovies(movieList, false, num, movieList);
            return;
        }
        el.previousElementSibling.classList.add('checked');
        addClassOfSiblings(el.previousElementSibling,false,num,movieList);
    }
};


//removed hover class to all next siblings until the last sibling(called recursevly)
let removeClassOfSiblings = (el, hover) => {
    if(hover) {
        if (el.previousElementSibling == null) {
            return;
        }
        el.previousElementSibling.classList.remove('hover');
        removeClassOfSiblings(el.previousElementSibling, true);
    } else {
        if (el.nextElementSibling == null) {
            return;
        }
        el.nextElementSibling.classList.remove('checked');
        removeClassOfSiblings(el.nextElementSibling);
    }
};



