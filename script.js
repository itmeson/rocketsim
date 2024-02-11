let previousTimestamp = performance.now();

const elt = document.getElementById('calculator');
const calculator = Desmos.GraphingCalculator(elt);
const graphBtn = document.getElementById('graphBtn');
graphBtn.addEventListener('click', function() {
    graphInDesmos();
});


const downloadBtn = document.getElementById('downloadBtn');
downloadBtn.addEventListener('click', function() {
    downloadCSV();
});

const resultMessage = document.getElementById('resultMessage');
const restartBtn = document.getElementById('restartBtn');

restartBtn.disabled = false;
restartBtn.addEventListener('click', function() {
    location.reload();
    // Reset container sizes
    gameContainer.style.height = "100%";
    elt.style.height = "0";
    rocket.style.display = "block"; // Show the rocket when restarting

});

const gameContainer = document.querySelector('.game-container');
gameContainer.addEventListener('mouseup', function() {
    // ... existing code ...

    // Adjust the height of the calculator container based on the game container's height
    const remainingHeight = window.innerHeight - gameContainer.clientHeight;
    elt.style.height = remainingHeight + 'px';
});

const rocket = document.querySelector('.rocket');
const velocityDisplay = document.getElementById('velocity');
const fuelDisplay = document.getElementById('fuel');
const altitudeDisplay = document.getElementById('altitude');
const rocketContainer = document.querySelector('.rocket-container');

const velocities = [];
const altitudes = [];
const fuels = [];
let startTime = null;
const times = [];


let velocity = 40; // Starting velocity in m/s
const gravityAcceleration = 7;  //Moon1.625; // m/s^2
const thrustAcceleration = 4; // m/s^2
let fuel = 200; // Starting fuel percentage
let thrusterOn = false;
const fuelConsumptionRate = 3; // Fuel use per second

document.addEventListener('keydown', (event) => {
  if (event.keyCode === 38 && fuel > 0) { // Up arrow key
    thrusterOn = true;
    rocket.classList.add('engine-on');  // Add the engine-on class

  }
});

document.addEventListener('keyup', (event) => {
  if (event.keyCode === 38) { // Up arrow key
    thrusterOn = false;
    rocket.classList.remove('engine-on');  // Remove the engine-on class
  }
});

function gameLoop(timestamp) {
  // Calculate delta time
  let deltaTime = (previousTimestamp === null) ? 0 : (timestamp - previousTimestamp) / 1000; // Convert to seconds
  previousTimestamp = timestamp;

  if (thrusterOn && fuel > 0) {
    velocity -= thrustAcceleration * deltaTime;
    fuel -= fuelConsumptionRate * deltaTime;
  } else {
    velocity += gravityAcceleration * deltaTime;
  }

  const currentTop = parseFloat(getComputedStyle(rocketContainer).top);
  rocketContainer.style.top = (currentTop + velocity * deltaTime) + "px"; // Adjust position using deltaTime

  // Update displays
  velocityDisplay.textContent = Math.round(velocity * 100*(-1)) / 100;
  fuelDisplay.textContent = Math.round(fuel);
  // Calculate altitude based on the rocket's position from the bottom of the screen
  const altitude = window.innerHeight - (currentTop + rocketContainer.clientHeight);
 // clientHeight is the height of the rocket
  altitudeDisplay.textContent = Math.round(altitude);

  if (startTime === null) {
    startTime = new Date().getTime();
  }
  const currentTime = new Date().getTime();
  const elapsedTime = (currentTime - startTime) / 1000; // Convert to seconds
  times.push(elapsedTime);
  velocities.push(-1* velocity);
  altitudes.push(altitude);
  fuels.push(fuel);  // store data

  //if (currentTop + rocket.clientHeight >= window.innerHeight) {
  if (currentTop + rocketContainer.clientHeight >= window.innerHeight) {
  // Rocket has landed
    if (velocity > 10) {
      resultMessage.textContent = 'You crashed! Try again.'
      //resultMessage.style.fontSize = '24px';
    } else {
      resultMessage.textContent = 'Safe landing!';
      //resultMessage.style.fontSize = '20px';
    }
    downloadBtn.disabled = false; // Enable the download button
    restartBtn.disabled = false; // enable the restart button
    graphBtn.disabled = false;    // Enable the graph button
  } else {
    requestAnimationFrame(gameLoop);
  }
}

function convertToCSV() {
    //let csvContent = "data:text/csv;charset=utf-8,";
    let csvContent = "Time,Velocity,Altitude,Fuel\n"; // Updated Headers

    for (let i = 0; i < velocities.length; i++) {
        csvContent += times[i] + "," + velocities[i] + "," + altitudes[i] + "," + fuels[i] + "\n";
    }

    return csvContent;
}


function downloadCSV() {
    const csvContent = convertToCSV();
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.style.display = "none";
    a.href = url;
    a.download = "simulation_data.csv";
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
}


function graphInDesmos() {
    const rocket = document.getElementById('rocket');
    rocket.style.display = "none"; // Hide the rocket
  
    // Convert data to CSV format
    const csvData = convertToCSV();

    // Clear any previous expressions
    calculator.setExpressions([]);

    // Import the CSV data
    calculator.setExpression({
        type: 'table',
        columns: [
            { latex: 't', values: times },
            { latex: 'v', values: velocities }, 
            { latex: 's', values: altitudes }
        ]
    });


    // Plot the data
    calculator.setExpression({ id: 'velocity-graph', latex: 'v(t)', color: Desmos.Colors.BLUE });
    calculator.setExpression({ id: 'altitude-graph', latex: 's(t)', color: Desmos.Colors.RED });

    // Resize containers
    
    gameContainer.style.height = "50%"; // or any desired height to reduce the game container
  
    const calculatorContainer = document.getElementById('calculator');
    calculatorContainer.style.height = "50%"; // or any desired height for the Desmos calculator
  
}



//gameLoop();
requestAnimationFrame(gameLoop);