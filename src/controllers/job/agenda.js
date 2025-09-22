import Agenda from "agenda";

export const agenda = new Agenda({
    db: { address: process.env.MONGODB_URI, collection: "jobs" },
    processEvery: "10 seconds", // poll frequency
});
