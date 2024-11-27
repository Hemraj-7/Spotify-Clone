console.log("Let's Write JavaScript!")
let currentSong = new Audio();
let songs;
let currentFolder;

function secondsToMinutesSeconds(seconds) {
    if (isNaN(seconds) || seconds < 0) {
        return "00:00";
    }

    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);

    const formattedMinutes = String(minutes).padStart(2, '0');
    const formattedSeconds = String(remainingSeconds).padStart(2, '0');

    return `${formattedMinutes}:${formattedSeconds}`;
}

async function getSongs(folder) {
    currentFolder = folder;
    let a = await fetch(`./${folder}/`);
    let response = await a.text();
    let div = document.createElement("div")
    div.innerHTML = response;
    let as = div.getElementsByTagName("a")
    songs = []
    for (let index = 0; index < as.length; index++) {
        const element = as[index];
        if (element.href.endsWith(".mp3")) {
            songs.push(element.href.split(`/${folder}/`)[1])
        }
    }

    // Show all the songs in the Playlist.
    let songUL = document.querySelector(".songList").getElementsByTagName("ul")[0]
    songUL.innerHTML = '';
    for (const song of songs) {
        songUL.innerHTML = songUL.innerHTML + `
        <li>
            <img class="invert" src="./img/music.svg" alt="">
            <div class="info">
                <div>${song.replaceAll("%20", " ")} </div>
                <div>Artist : Hemsa</div>
            </div>
            <div class="playnow">
                <span>Play Now</span>
                <img class="invert" src="./img/play.svg" alt="">
            </div>
        </li>`;
    }

    // Attech an event listener to each song.
    Array.from(document.querySelector(".songList").getElementsByTagName("li")).forEach(e => {
        e.addEventListener("click", element => {
            // console.log('hello! darling');

            console.log(e.querySelector(".info").firstElementChild.innerHTML);
            playMusic(e.querySelector(".info").firstElementChild.innerHTML.trim())
        })
    })
    return songs;
}


const playMusic = (track, pause = false) => {
    // let audio = new Audio("/songs/"+track);
    currentSong.src = `/${currentFolder}/` + track;
    if (!pause) {
        currentSong.play();
        play.src = "./img/pause.svg";
    }
    document.querySelector(".songInfo").innerHTML = decodeURI(track);
    document.querySelector(".songTime").innerHTML = " 00:00 / 00:00 "
}

async function displayAlbums() {
    let a = await fetch(`./songs/`)
    let response = await fetch(`/songs/${folder}/info.json`);
    // let response = await a.text();
    // let a = await fetch(`/songs/`);
    // let response = await fetch(`/songs/${folder}`);
    let div = document.createElement("div")
    div.innerHTML = response;
    let anchors = div.getElementsByTagName("a")
    let cardContainer = document.querySelector(".cardContainer")
    let array = Array.from(anchors)
    for (let index = 0; index < array.length; index++) {
        const e = array[index];
        // if(e.href.startsWith(`http://127.0.0.1:3000/songs/`)) //same work as down if
        if (e.href.includes(`/songs`)) {
            let folder = e.href.split("/").slice(-2)[0]
            // get the meta data of the folder
            let a = await fetch(`./songs/${folder}/info.json`)
            let response = await a.json();
            console.log(response);
            cardContainer.innerHTML = cardContainer.innerHTML + `<div data-folder="${folder}" class="card rounded">
            <div class="play">
                <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24">
                    <circle id="circle" cx="12" cy="12" r="12" fill="#1fdf64" />
                    <style>
                        #circle:hover {
                            fill: #00ff00;
                        }
                    </style>
                    <polygon points="9,8 17,12 9,16" fill="#000" />
                </svg>
            </div>
            <img src="/songs/${folder}/cover.jpeg" alt="" onerror="this.onerror=null; this.src='/songs/${folder}/cover.jpg';">
            <h2>${response.title}</h2>
            <p>${response.description}</p>
        </div>`

        }
    }
    // Load the playlist whenever card is clicked
    Array.from(document.getElementsByClassName("card")).forEach(e => {
        // console.log(e);
        e.addEventListener("click", async item => {
            // console.log(item.target, item.currentTarget.dataset);
            songs = await getSongs(`songs/${item.currentTarget.dataset.folder}`)
            playMusic(songs[0])
        })
    })
}

async function main() {
    // Get the list of all Songs.
    await getSongs(`songs/lofi`)
    playMusic(songs[0], true)

    // display all the albums on the page
    await displayAlbums();

    // Attech an event listener to previous, play and next buttons.
    play.addEventListener("click", () => {
        if (currentSong.paused) {
            currentSong.play()
            play.src = "./img/pause.svg"
        }
        else {
            currentSong.pause()
            play.src = "./img/play.svg"
        }
    })


    // Listen for timeupdate event.
    currentSong.addEventListener("timeupdate", () => {
        document.querySelector(".songTime").innerHTML = `${secondsToMinutesSeconds(currentSong.currentTime)} / ${secondsToMinutesSeconds(currentSong.duration)}`
        document.querySelector(".circle").style.left = (currentSong.currentTime / currentSong.duration) * 100 + '%';
    })

    // Add an event listener to seekbar
    document.querySelector(".seekbar").addEventListener("click", (e) => {
        let parcent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
        document.querySelector(".circle").style.left = parcent + "%";
        currentSong.currentTime = ((currentSong.duration) * parcent) / 100;
    })

    // Add an event listener for hamburger
    document.querySelector(".hamburger").addEventListener("click", () => {
        document.querySelector(".left").style.left = "0%"
    })

    // Add an event listener for close button
    document.querySelector(".close").addEventListener("click", () => {
        document.querySelector(".left").style.left = "-100%"
    })

    // Add an event listener for Previous
    previous.addEventListener("click", () => {
        console.log('Previous song');
        let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0])
        if ((index - 1) >= 0) {
            playMusic(songs[index - 1])
        }


    })

    // Add an event listener for next
    next.addEventListener("click", () => {
        currentSong.pause();
        console.log('next song');
        let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0])
        if ((index + 1) < songs.length) {
            playMusic(songs[index + 1])
        }
    })

    // Add an event to volume
    document.querySelector(".range").getElementsByTagName("input")[0].addEventListener("change", (e) => {
        console.log("Setting Volume to : " + e.target.value + " / 100");
        currentSong.volume = e.target.value / 100;
        if (currentSong.volume > 0) {
            document.querySelector(".volume>img").src = document.querySelector(".volume>img").src.replace("mute.svg", "volume.svg")
        }
    })

    // Add event listener to mute the track
    document.querySelector(".volume>img").addEventListener("click", e => {
        if (e.target.src.includes("volume.svg")) {
            e.target.src = e.target.src.replace("volume.svg", "mute.svg")
            currentSong.volume = 0;
            document.querySelector(".range").getElementsByTagName("input")[0].value = 0;
        }
        else {
            e.target.src = e.target.src.replace("mute.svg", "volume.svg")
            currentSong.volume = .10;
            document.querySelector(".range").getElementsByTagName("input")[0].value = 50;
        }

    })

}

main();
