import { config } from "dotenv"
config()

import { seed as seedUsers } from "./users"

Promise.resolve(seedUsers())
    .then(() => {
        console.log("Seeding complete")
        process.exit(0)
    })
    .catch((err) => {
        console.error("Error seeding data:", err)
        process.exit(1)
    })