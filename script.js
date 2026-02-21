function bgChange(something) {
    const inside = document.getElementById("bgChange")

    if(something !== undefined){
        if(something === "dark")
            turnDark()
        else
            turnLight()
        return
    }

    if(inside.querySelector("i.fa-solid.fa-sun"))
        turnLight()
    else
        turnDark()
    saveSelectedDivs()
}

function turnLight(){
    const inside = document.getElementById("bgChange")
    const bod = document.body
    const title = document.getElementById("title")
    const subtitle = document.getElementById("subtitle")
    const table = document.getElementById("raspored")
    inside.innerHTML = "<i class=\"fa-solid fa-moon\" style=\"font-size: 30px; color: gray\" ></i>"
    bod.style.backgroundColor = "#bcdae3"
    table.style.backgroundColor = "#bcdae3"
    table.style.color = "black"
    const cells = table.querySelectorAll("td, th");
    cells.forEach(cell => {
        cell.style.border = "2px solid black";
    });
    title.style.color = "black"
    subtitle.style.color = "black"
    inside.style.backgroundColor = "#272f32"
    inside.classList.add("light")
    inside.classList.remove("dark")
}
function turnDark(){
        const inside = document.getElementById("bgChange")
    const bod = document.body
    const title = document.getElementById("title")
    const subtitle = document.getElementById("subtitle")
    const table = document.getElementById("raspored")
    inside.innerHTML = "<i class=\"fa-solid fa-sun\" style=\"font-size: 30px; color: #eaea38\"></i>"
    bod.style.backgroundColor = "#272f32"
    table.style.backgroundColor = "#272f32"
    table.style.color = "white"
    const cells = table.querySelectorAll("td, th");
    cells.forEach(cell => {
        cell.style.border = "2px solid white";
    });
    inside.style.backgroundColor = "#bcdae3"
    title.style.color = "white"
    subtitle.style.color = "white"
    inside.classList.add("dark")
    inside.classList.remove("light")
}

async function loadSchedulea() {
    const selected = document.getElementById("selectSubject").value;
    try {
    const response = await fetch('schedules.json');
    const schedules = await response.json();

    const data = schedules[selected];
    loadSchedule(data)
    } catch (error) {
        console.error('Проблем при лоадирање:', error);
    }
}

function deleteUnSelected() {
    const rows = document.querySelectorAll("#Times tr");
    rows.forEach(row => {
        for (let i = 1; i < row.cells.length; i++) {
            const cell = row.cells[i];
            const selectedDivs = cell.querySelectorAll("div.selected");

            if (selectedDivs.length > 0) {
                cell.querySelectorAll("div").forEach(div => {
                    if (!div.classList.contains("selected")) {
                        div.remove();
                    }
                });
            } else {
                cell.textContent = "";
            }
        }
    });
}

function loadSchedule(data) {
    deleteUnSelected()

    const rows = document.querySelectorAll("#Times tr");
    data.forEach(item => {
        for (let i = 0; i < item.hours; i++) {
            const row = rows[item.row + i];
            const cell = row.cells[item.col];

            const dontAdd = Array.from(cell.querySelectorAll("div")).some(div => div.textContent === item.text);

            if (!dontAdd) {
            const newDiv = document.createElement("div");
            newDiv.textContent = item.text;
            newDiv.classList.add("fancy");

            newDiv.onclick = function () {
                keepOnScreen(this);
            };
                cell.appendChild(newDiv);
            }
        }
    });
}

function keepOnScreen(element){
    if(element.classList.contains("selected")){
        element.classList.remove("selected")
        element.style.backgroundColor = ''
        element.querySelectorAll("span").forEach(span => {span.remove()})
        saveSelectedDivs()
    }
    else{
        element.classList.add("selected")
        chaneColor(element)
        keepOnScreenTwo(element)
        saveSelectedDivs()
    }
}

function keepOnScreenTwo(element){
    const lockSpan = document.createElement("span");
    lockSpan.classList.add("fa-solid","fa-lock","icon")
    const colorSpan = document.createElement("span");
    colorSpan.classList.add("fa-solid","fa-palette","icon")

    colorSpan.onclick = function(hop) {
        hop.stopPropagation();
        chaneColor(this.parentElement);
    };

    element.appendChild(lockSpan);
    element.appendChild(colorSpan);
}

let schedulesCache = null;

async function getSchedules() {
    if (!schedulesCache) {
        const response = await fetch('schedules.json');
        schedulesCache = await response.json();
    }
    return schedulesCache;
}

async function returnSelect() {
    const select = document.getElementById("selectSubject");
    select.innerHTML = "";

    const schedules = await getSchedules();

    Object.keys(schedules).forEach(key => {
        const option = document.createElement("option");
        option.value = key;
        option.textContent = key;
        select.appendChild(option);
    });
}

document.addEventListener("DOMContentLoaded", function () {
    returnSelect();
    restoreSelectedDivs()

    document.querySelectorAll("#Times div").forEach(div => {
        div.addEventListener("click", saveSelectedDivs);
    });
});


function saveTableAsImage() {
    const table = document.getElementById("raspored");
    deleteUnSelected()

    document.querySelectorAll(".icon").forEach(el => {
        el.style.display = "none";
    });

    html2canvas(table).then(canvas => {
        const link = document.createElement("a");
        link.download = "raspored.png";
        link.href = canvas.toDataURL("image/png");
        link.click();
    });

        document.querySelectorAll(".icon").forEach(el => {
        el.style.display = "";
    });
}



function saveSelectedDivs() {
    const selectedDivs = [];
    const rows = document.querySelectorAll("#Times tr");
    const chooseColorFromHere = document.getElementById("colorPicker").value;
    const inside = Array.from(document.getElementById("bgChange").classList)

    rows.forEach((row, rowIndex) => {
        row.querySelectorAll("td").forEach((cell, colIndex) => {
            cell.querySelectorAll("div.selected").forEach(div => {
                selectedDivs.push({
                    row: rowIndex,
                    col: colIndex,
                    text: div.textContent,
                    colorP: div.style.backgroundColor,
                    whatColor: chooseColorFromHere,
                    whatBG: inside[0]
                });
            });
        });
    });

    localStorage.setItem("selectedDivs", JSON.stringify(selectedDivs));
}

function restoreSelectedDivs() {
    const saved = JSON.parse(localStorage.getItem("selectedDivs") || "[]");
    const rows = document.querySelectorAll("#Times tr");
    const chooseColorFromHere = document.getElementById("colorPicker");

    saved.forEach(item => {
        const row = rows[item.row];
        const cell = row.cells[item.col];

        let div = Array.from(cell.querySelectorAll("div"))
            .find(d => d.textContent === item.text);

        if (!div) {
            div = document.createElement("div");
            div.textContent = item.text;
            keepOnScreenTwo(div);
            div.classList.add("fancy");
            div.style.backgroundColor = item.colorP;
            bgChange(item.whatBG);

            div.onclick = function() {
                keepOnScreen(this);
            };

            cell.appendChild(div);
        }

        div.classList.add("selected");
        chooseColorFromHere.value = item.whatColor
    });
}

function deleteAll() {
    const rows = document.querySelectorAll("#Times tr");
    rows.forEach(row => {
        for (let i = 1; i < row.cells.length; i++) {
            row.cells[i].innerHTML = "";
        }
    });
    saveSelectedDivs();
}

function chaneColor(element){
    const chooseColorFromHere = document.getElementById("colorPicker");
    element.style.backgroundColor = chooseColorFromHere.value;
}


function turnOff(element){
    element.style.display = "none";
}

function addLab(){
    const begin = document.getElementById("begin")
    const end = document.getElementById("end")
    const day = document.getElementById("whichDaySelect")
    const warn = document.getElementById("warning")
    const text = document.getElementById("labName")
    if(begin.value === "" || end.value === "" || text.value === ""){
        warn.style.display = "";
        return
    }
    warn.style.display = "none";
    let parsedStart = parseInt(begin.value.split(":")[0])
    parsedStart = parsedStart-8;
    let parsedEndFull = end.value.split(":")
    let parsedEnd = 0
    if(parseInt(parsedEndFull[1],10) === 0){
        parsedEnd = parseInt(parsedEndFull[0],10) - 9
    }
    else
        parsedEnd = parseInt(parsedEndFull[0],10) - 8

    addLabOnTable(parsedStart,parsedEnd,day.value,text)
}
function labPopup(){
    const popup = document.getElementById("labsPopUp")
    popup.style.display = "flex";
}

function closePopup() {
    const popup = document.getElementById("labsPopUp")
    popup.style.display = "none";
}

function addLabOnTable(start, end, day, text){
    const rows = document.querySelectorAll("#Times tr");
    let howLong = end-start
    howLong = howLong + 1
    for (let i = 0; i < howLong; i++) {
        const row = rows[start+i];
        const cell = row.cells[day];
        const begin = document.getElementById("begin");
        const end = document.getElementById("end");
        const all = (text.value + " - " + begin.value + " до " + end.value);

        const dontAdd = Array.from(cell.querySelectorAll("div")).some(div => div.textContent === all);

        if (!dontAdd) {
            const newDiv = document.createElement("div");
            newDiv.textContent = text.value + " - " + begin.value + " до " + end.value;
            newDiv.classList.add("fancy");

            newDiv.onclick = function () {
                keepOnScreen(this);
            };
            cell.appendChild(newDiv);
        }
    }
}