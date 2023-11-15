class Job {
    constructor(jobName, jobSize) {
        this.jobName = jobName;
        this.jobSize = jobSize;
    }
}

/*
    END OF JOB CODE
    START OF MEMORY CODE
*/

class Memory {
    constructor(totalMemorySize, osSize, jobList) {
        this.totalMemorySize = totalMemorySize;
        this.osSize = osSize;
        this.queue = jobList;

        // Remaining available size of memory
        this.availableSize = this.totalMemorySize - this.osSize;
        
        // Representation of the physical RAM
        this.wholeMemory = [new Job("OS", this.osSize)];

        // Allocate jobs in queue to memory
        this.initialAllocation();
    }

    // Method used by constructor
    initialAllocation() {
        // Iterate through the queue
        let i = 0;
        while (i < this.queue.length) {
            // Determine if job can fit in memory
            if (this.queue[i].jobSize < this.availableSize) {
                // push to memory if it can fit
                this.wholeMemory.push(this.queue[i]);

                // Dequeue job
                this.availableSize -= this.queue[i].jobSize;
                this.queue = this.queue.slice(0, i).concat(this.queue.slice(i+1));
            } else {
                i++;
            }
        }
        this.wholeMemory.push(new Job("free", this.availableSize));
    }

    /*  
        Deallocates jobs in memory
        Don't forget to implement a try catch for when user inputs index beyond array length
        Also update to disallow the removal of OS 
    */
    deallocate(deallocateList) { // indexes of jobs!
        for (let i = 0; i < deallocateList.length; i++) {
            if (this.wholeMemory[deallocateList[i]].jobName != "free") {
                this.wholeMemory[deallocateList[i]].jobName = "free";
                this.availableSize += this.wholeMemory[deallocateList[i]].jobSize;
            }
        }
    }

    /*
        Compacts free space in memory
        This code works for some reason
    */
    compaction() {
        let currentJob;
        let i = 0;
        
        /*
        let freeInLast = this.wholeMemory.pop();
        is this even necessary?????
        */

        while (i < this.wholeMemory.length) {
            currentJob = this.wholeMemory[i];
            if (currentJob.jobName === "free") {
                // Add free space to total available memory
                //this.availableSize += currentJob.jobSize;

                // Move up the jobs
                this.wholeMemory = this.wholeMemory.slice(0, i).concat(this.wholeMemory.slice(i+1));
            } else {
                i++;
            }
        }
        // Add frame with size of remaining available space
        this.wholeMemory.push(new Job("free", this.availableSize));
    }

    /*
        Method accepts an array of jobs
    */
    allocate() {

    }

    // Method to show jobs allocated in memory
    viewMemory() {
        console.log("Memory");
        for (let i = 0; i < this.wholeMemory.length; i++) {
            console.log(this.wholeMemory[i].jobName + " " + this.wholeMemory[i].jobSize);
        }
    }

    // Method to show jobs in queue
    viewQueue() {
        console.log("Queue");
        for (let i = 0; i < this.queue.length; i++) {
            console.log(this.queue[i].jobName + " " + this.queue[i].jobSize);
        }
    }
}

/*
    END OF MEMORY CODE
    START OF WEBPAGE ACTIONS
*/

function getTotalSize(form) {
    return form.totalMemorySizeForm.value;
}

function getJobSizes(form) {
    return form.jobSizesForm.value;
}

function getOsSize(form) {
    return form.osSizeForm.value;
}

function processData(form) {
    // Variables used to name the jobs being added to the job list
    let jobNum;
    let jobName;

    let totalSize = getTotalSize(form);
    let osSize = getOsSize(form);
    let jobs_string = getJobSizes(form);

    // Converts string into array containing integers
    let jobSize_array = jobs_string.split(" ").map(Number);

    let jobList = [];

    // Place OS in beginning
    jobList.push(new Job("OS", osSize));

    for (let i = 0; i < jobSize_array.length; i++) {
        jobNum = i+1;
        jobName = "job" + jobNum;
        jobList.push(new Job(jobName, jobSize_array[i]));
    }

    let myMemory = new Memory(totalSize, osSize, jobList);
    saveMemoryState(myMemory);
    myMemory.viewMemory();
    createTable(myMemory);
}

function saveMemoryState(memoryInstance) {
    localStorage.setItem('memoryState', JSON.stringify({
      totalMemorySize: memoryInstance.totalMemorySize,
      osSize: memoryInstance.osSize,
      queue: memoryInstance.queue,
      availableSize: memoryInstance.availableSize,
      wholeMemory: memoryInstance.wholeMemory.map(job => ({
        jobName: job.jobName,
        jobSize: job.jobSize
      }))
    }));
}

// Function to load Memory object state from localStorage
function loadMemoryState() {
    const memoryState = localStorage.getItem('memoryState');
    if (memoryState) {
      const state = JSON.parse(memoryState);
      const jobObjects = state.wholeMemory.map(job => new Job(job.jobName, job.jobSize));
      const memory = new Memory(state.totalMemorySize, state.osSize, state.queue);
      memory.availableSize = state.availableSize;
      memory.wholeMemory = jobObjects;
      return memory;
    }
    return null; // Return null if no saved state found
}

/*
function testTestP() {
    var p = document.getElementById("testp");
    p.textContent = "WORKING?";
}
*/

function createTable(memory) {
    console.log("Creating Table");
    var table = document.getElementById("outputTable");

    if (!table) {
        console.error("Table element not found!");
        return;
    }

    table.innerHTML = ''; // Clear any existing content in the table

    var headerRow = table.insertRow(0);
    var headerCell1 = document.createElement("th");
    var headerCell2 = document.createElement("th");
    var headerCell3 = document.createElement("th");

    headerCell1.textContent = "Index";
    headerCell2.textContent = "Name";
    headerCell3.textContent = "Size";

    headerRow.appendChild(headerCell1);
    headerRow.appendChild(headerCell2);
    headerRow.appendChild(headerCell3);

    for (let i = 0; i < memory.wholeMemory.length; i++) {
        console.log(`Job Name: ${memory.wholeMemory[i].jobName}`);

        var row = table.insertRow(i + 1);

        var cell1 = row.insertCell(0); // First column
        var cell2 = row.insertCell(1); // Second column
        var cell3 = row.insertCell(2);

        cell1.textContent = i; // Partition Index
        cell2.textContent = memory.wholeMemory[i].jobName; // Partition Size
        cell3.textContent = memory.wholeMemory[i].jobSize;
    }
    // Log information about the row being inserted
}