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
|    └── utils.js
|    └── package.json
server
└── index.js
└── package.json
```

## Usage instructions
Clone this repo, install the packages, fire up the servers and you should be good to go!

To start the backend server: 
```
cd server && npm install && npm start
```

To start the frontend server: 
```
cd client && yarn && yarn start
```


Frontend application listens at `http://localhost:3000/`

Backend server listens at `http://localhost:3001/`


## Run tests

```
cd client && yarn test --coverage --watchAll
```

## Tech Stack
1. React (Create-React-App)
2. Node + Express backend with nodemon for watching changes
3. [Recharts](https://recharts.org/en-US/)
4. Moment.js to work with time

Note: Node >= v10 is required.

## Design
At any moment, the system can be in one of the 3 states:
1. Normal
2. Critical
3. Recovering

**Normal**: The system starts out in the Normal state. If it goes into a critical state and starts recovering, it has to be recovered for > 2 minutes to be considered in the Normal state again.

**Critical**: When the `Avg CPU Load > 1` for atleast 2 minutes.

**Recovering**: When the system is in Critical state, and immediately a `Avg. CPU Load` drops below 1, the machine goes into Recovering state. The System **may or may not** recover after this dip, but it seems like a potential candidate for recovery. Now if we see a `Avg. CPU Load > 1` at any point during recovery, the system again goes back to Critical state. If no high load is seen for atleast 2 minutes, the system is considered as *recovered* and it moves to Normal state.

Transitioning from one state to another is managed by State Machine.


### State Machine:

```
currentState => (action, payload) => nextState
```

State Machine manages the state of our system. We start our machine in Normal state. Each state can have 2 actions: **HIGH** and **LOW**.

**HIGH** means a system is under heavy load(>1).

**LOW** means the load is < 1

When we receive a load from the server, an appropriate action is dispatched along with the payload. Based on the action and payload, the machine may transition to some other state or stay in the same state.

### Persistance
I've used Local Storage to store all the data and the state of the machine for the current 10 minutes window. The application will persist state across browser refreshes.

### Test cases
The entire **Under High Load** and **Recovery** logic is built using **State Machine**.
It's been tested thoroughly and all the test cases are present inside `client/src/tests/stateMachine.test.js`. You can run them:

```
cd client && yarn test --coverage --watchAll
```

Besides State Machine, I've also added a few test cases for utility methods.


### Improvements
- In a production system, we will need to think about the case where we had to keep a larger dataset, the amount of granularity we could provide, etc.  For a 10 minutes window, we're keeping an array of 60 values (keeping a value for every 10 seconds), but if that time window were to grow larger or if we had to keep a value for every, say, 3 seconds, the data may at some point be too large to keep in memory. In that case, we can probably compact old data to a lower granularity.
- Since the state machine was the most critical aspect of the system, I have written extensive tests for it. It has full test coverage. I haven't written tests for the UI components, but they are really simple, there are close to no interactions, so it would be simple to write tests if needed.
