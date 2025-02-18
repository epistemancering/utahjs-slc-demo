const topicsUl = /**@type {HTMLUListElement}*/(document.querySelector("ul"))
const body = String(Math.random())

const downloadTopics = async () => {
    const topicsList = await (await fetch("/topics", { method: "POST", body })).json()
    let topicsHTML = ""

    for (const topic in topicsList) {
        topicsHTML += `<li>
            <input id = "li${topic}" type = "checkbox" ${localStorage[topic]}>
            ${topic}: ${topicsList[topic]} votes
        </li>`
    }

    topicsUl.innerHTML = topicsHTML
    downloadTopics()
}

downloadTopics()

topicsUl.onclick = async (/**@type {MouseEvent}*/ event) => {
    const clickedInput = /**@type {HTMLInputElement}*/(event.target)

    if (clickedInput.id) {
        clickedInput.disabled = true
        const topic = clickedInput.id.slice(2)
        let vote

        if (localStorage[topic]) {
            vote = -1
            delete localStorage[topic]
        } else {
            vote = 1
            localStorage[topic] = "checked"
        }

        await fetch(
            "/update",
            {
                method: "POST",
                body: JSON.stringify({ topic, vote })
            }
        )

        clickedInput.disabled = false
    }
}

const topicForm = /**@type {HTMLFormElement}*/(document.querySelector("form"))
const topicFieldset = /**@type {HTMLFieldSetElement}*/(document.querySelector("fieldset"))
const scratchDiv = document.createElement("div")

topicForm.onsubmit = async (/**@type {SubmitEvent}*/ event) => {
    event.preventDefault()
    let topic = /**@type {string}*/(new FormData(topicForm).get("input"))
    topicFieldset.disabled = true

    if (event.submitter?.innerHTML === "add sanitized topic") {
        scratchDiv.innerText = topic
        topic = scratchDiv.innerHTML
    }

    await fetch(
        "/update",
        {
            method: "POST",
            body: JSON.stringify({ topic })
        }
    )

    topicForm.reset()
    topicFieldset.disabled = false
}