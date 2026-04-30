import { config } from "dotenv"
config()

import { seed as seedUsers } from "./users"
import { seed as seedActivities } from "./activities"
import { seed as seedFriends } from "./friends"

Promise.resolve(seedUsers())
    .then((userCount) => {
        console.log(`Seeded ${userCount} users`)
        return seedActivities()
    })
    .then((activityCount) => {
        console.log(`Seeded ${activityCount} activities`)
        return seedFriends()
    })
    .then((friendshipCount) => {
        console.log(`Seeded ${friendshipCount} friendships`)
        console.log("Seeding complete")
        process.exit(0)
    })
    .catch((err) => {
        console.error("Error seeding data:", err)
        process.exit(1)
    })