<div align="center">
    <h1>Watch Dog</h1>
    <p>A system load monitoring application</p>
</div>

## Folder Structure
```
client
└── src
|    └── components/
|    └── tests/
|    ├── App.css
|    ├── constants.js
|    └── App.js
|    └── utils
|    └── package.json
server
└── index.js
└── package.json
```

## Usage instructions
Clone this repo, install the packages, fire up the servers and you should be good to go!

To start the frontend server: 
```
cd client && yarn && yarn start
```

To start the backend server: 
```
cd server && npm install && npm start
```

Frontend application listens at `http://localhost:3000/`

Backend server listens at `http://localhost:3001/`


## Run tests

```
cd client && yarn test -- --coverage
```

## Tech Stack
1. React (Create-React-App)
2. Node + Express backend with nodemon for watching changes
3. [Recharts](https://recharts.org/en-US/)
4. Moment.js to work with time

## Design
At any moment, the system can be in any of the 3 states:
1. NORMAL
2. CRITICAL
3. RECOVERING

**NORMAL**: When the system is running smoothly under `CPU Load Avg < 1 ` for **atleast 2 mins**. **Note:** Recovered system is considered as NORMAL only.

**CRITICAL**: When the `Avg CPU Load > 1` for **atleast 2 mins**.

**RECOVERING**: When the system is at CRITICAL state, and immediately a load avg drops below 1, the machine goes into RECOVERING state. The System **may or may not** recover after this dip, but this seems like a potential candidate for recovery. Now if we see a high load of > 1 at any point during recovery, the system goes back to CRITICAL state. If no high load is seen for atleast 2 mins, the system is considered as recovered and it moves to NORMAL state.


### State Machine:

```
currentState => (action, payload) => nextState
```

State Machine manages the state of our system. We start our machine at NORMAL state. Each state can have 2 actions: **HIGH** and **LOW**. HIGH means a system is under heavy load(>1) and LOW means the load is < 1.

When we receieve a load from the server, an appropriate action is fired along with the payload. Based on the action and payload, the machine may transition to some other state or stay at same state.


### Test cases
The entire **Under High Load** and **Recovery** logic is built using **State Machine**.
It's been tested thoroughly and all the test cases are present inside `client/src/tests/stateMachine.test.js`

Besides State Machine, I've also added a few test cases for utility methods.
