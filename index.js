import { openai } from './config.js';

const form = document.querySelector('form');
const input = document.querySelector('input');
const reply = document.querySelector('.reply');

// Assistant variables
const asstID = "asst_GSl7JnXxGp2ArDFVkfmBULDn";
const threadID = "thread_RpTzDM6Hm6wG3UAj1o2e93xM";

form.addEventListener('submit', function (e) {
    e.preventDefault();
    main();
    input.value = '';
});

// Bring it all together
async function main() {
    reply.innerHTML = 'Thinking...';

    await createMessage(input.value);

    const run = await runThread();

    let currentRun = await retrieveRun(threadID, run.id);

    // Keep Run status up to date
    // Poll for updates and check if run status is completed    
    while (currentRun.status !== 'completed') {
        await new Promise(resolve => setTimeout(resolve, 1500));
        console.log(currentRun.status);
        currentRun = await retrieveRun(threadID, run.id);
    }

    const { data } = await listMessages();
    console.log(data)

    reply.innerHTML = data[0].content[0].text.value;

}



/* -- Assistants API Functions -- */

// Create a message
async function createMessage(question) {
    const threadMessages = await openai.beta.threads.messages.create(
        threadID,
        { role: "user", content: question }
    );
}

// Run the thread / assistant
async function runThread() {
    const run = await openai.beta.threads.runs.create(
        threadID,
        {
            assistant_id: asstID,
            instructions: `Please remove any source references in your reply. Only reply about movies in the provided file. If questions are not related to movies, respond with "Sorry, I don't know." Keep your answers short.`
        }
    );
    return run;
}

// List thread Messages
async function listMessages() {
    return await openai.beta.threads.messages.list(threadID)
}

// Get the current run
async function retrieveRun(thread, run) {
    return await openai.beta.threads.runs.retrieve(thread, run);
}




// // Upload a file with an "assistants" purpose
// const file = await openai.files.create({
//     file: await fetch("./movies.txt"),
//     purpose: "assistants",
// });

// console.log(file)

// const thread = await openai.beta.threads.create();
// // console.log('thread: ', thread)
// const threadID = thread.id

// async function createMessage() {
//     const threadMessages = await openai.beta.threads.messages.create(
//         threadID,
//         { role: "user", content: "Can you recommend a comedy?" }
//     );
//     console.log(threadMessages)
// }

// createMessage()

// async function main() {

//     async function createAssistant() {
//         const myAssistant = await openai.beta.assistants.create({
//             instructions:
//                 "You are great at recommending movies. When asked a question, use the information in the provided file to form a friendly response. If you cannot find the answer in the file, do your best to infer what the answer should be.", name: "Math Tutor",
//             name: "Movie Expert",
//             tools: [{ type: "retrieval" }],
//             model: "gpt-4-turbo-preview",
//             file_ids: [file.id]
//         });

//         console.log(myAssistant);

//         const assistantId = myAssistant.id


//         async function runThread() {
//             const run = await openai.beta.threads.runs.create(
//                 threadID,
//                 { assistant_id: assistantId }
//             );
//             console.log(run);

//             // Get the current run
//             const currentRun = await openai.beta.threads.runs.retrieve(
//                 threadID,
//                 run.id
//             );
//             console.log("Run status: " + currentRun.status);
//         }

//         runThread()

//         // List thread messages
//         async function listMessages() {
//             const threadMessages = await openai.beta.threads.messages.list(threadID);

//             console.log(threadMessages.data);
//         }
//         listMessages()
//     }

//     createAssistant()

// }

// main()
