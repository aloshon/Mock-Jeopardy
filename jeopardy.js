const baseUrl = "https://jservice.io/api";
let row = 6;
let col = 5;

let categories = [];


/** Get NUM_CATEGORIES random category from API.
 *
 * Returns array of category ids
 */

async function getCategoryIds() {
    const getResponse = await axios.get(`${baseUrl}/categories?count=100`);
    const categoryData = getResponse.data.map((cat) =>
        cat.id
    );
    return _.sampleSize(categoryData, row);
}

/** Return object with data about a category:
 *
 *  Returns { title: "Math", clues: clue-array }
 *
 * Where clue-array is:
 *   [
 *      {question: "Hamlet Author", answer: "Shakespeare", showing: null},
 *      {question: "Bell Jar Author", answer: "Plath", showing: null},
 *      ...
 *   ]
 */

async function getCategory(catId) {
    let response = await axios.get(`${baseUrl}/category?id=${catId}`);
    let cat = response.data;
    let allClues = cat.clues;
    let randomClues = _.sampleSize(allClues, col);
    let clues = randomClues.map(clue => ({
      question: clue.question,
      answer: clue.answer,
      showing: null,
    }));
  
    return { title: cat.title, clues };
  }

/** Fill the HTML table#jeopardy with the categories & cells for questions.
 *
 * - The <thead> should be filled w/a <tr>, and a <td> for each category
 * - The <tbody> should be filled w/NUM_QUESTIONS_PER_CAT <tr>s,
 *   each with a question for each category in a <td>
 *   (initally, just show a "?" where the question/answer would go.)
 */

async function fillTable() {
    $("#jeopardy thead").empty();
    let $tr = $("<tr>");
    for (let x = 0; x < row; x++) {
        $tr.append($("<th>").text(categories[x].title));
  }
    $("#jeopardy thead").append($tr);

  // Add rows with questions for each category
    $("#jeopardy tbody").empty();
    for (let y = 0; y < col; y++) {
        let $tr = $("<tr>");
        for (let x = 0; x < row; x++) {
            const $td = $("<td>").attr("id", `${x}-${y}`).text("?");
            $tr.append($td);
    }
    $("#jeopardy tbody").append($tr);
  }
}


/** Handle clicking on a clue: show the question or answer.
 *
 * Uses .showing property on clue to determine what to show:
 * - if currently null, show question & set .showing to "question"
 * - if currently "question", show answer & set .showing to "answer"
 * - if currently "answer", ignore click
 * - added background colors to make clear what is a question or an answer.
 * */

function handleClick(event) {
    let id = event.target.id;
    let [catId, clueId] = id.split("-");
    let clue = categories[catId].clues[clueId];
    let msg;
    
    if (!clue.showing) {
        msg = clue.question;
        clue.showing = "question";
        event.target.style.backgroundColor = "silver";
        event.target.style.minWidth = "145px";
        event.target.style.minHeight = "150px";
    } 
    else if (clue.showing === "question") {
        msg = clue.answer;
        clue.showing = "answer";
        event.target.style.backgroundColor = "gold";
        event.target.style.minWidth = "145px";
        event.target.style.minHeight = "150px";
    } 
    else {
        return;
    }

    $(`#${catId}-${clueId}`).html(msg);
}

/** After some time, notify player that the game is finished loading */
async function hideLoadingView() {
    btn.innerText = "Done!";  
    setTimeout(function(){
        btn.innerText = "Start New Game"
    }, 700);
};

/** Wipe the current Jeopardy board, show loading text on button,
 * and update the button used to fetch data.
 */
const btn = document.getElementById("restart");

btn.addEventListener("click", function(){
    btn.innerText = "Loading...";
    setTimeout(function(){
        hideLoadingView()
    }, 1000);
});

/** Start game:
 *
 * - get random category Ids
 * - get data for each category
 * - create HTML table
 * */
async function setupAndStart() {
    let categoryIds = await getCategoryIds();
    
    categories = [];

    for (let categoryId of categoryIds) {
        categories.push(await getCategory(categoryId));
      }
    
      fillTable();
}

/** On click of start / restart button, set up game. */
btn.addEventListener("click", function(event){
    event.preventDefault();

    setupAndStart();
});

/** On page load, add event handler for clicking clues */
$(async function (){
    setupAndStart();
    $("#jeopardy tbody").innerText = '';
    $("#jeopardy").on("click", "td", handleClick);
});
