const formMessage = function(caller, msg) {
    return `DroneTracer, ${caller} | ${msg}`
}

const errorThrow = function(msg) {
    throw formMessage(arguments.callee.caller.name, msg)
}

const errorReject = function(promiseReject, msg) {
    promiseReject( formMessage(arguments.callee.caller.name, msg) )
}

export {errorThrow as throw, errorReject as reject}


export class ProgressReport {
    constructor(callback = ()=>{}) {
        this.callback = callback
        this.steps = 1
        this.step = 0
    }

    setSteps(steps) {
        this.steps = steps
    }

    setStep(step) {
        this.step = step
    }

    increaseStep() {
        ++this.step
    }

    report(full, qnt) {
        var mstep = parseFloat(qnt) / full
        var status = Math.min(1, Math.max(0, parseFloat(this.step+mstep) / this.steps))
        this.log(status)
    }

    reportIncreaseStep() {
        this.increaseStep()
        this.report(1,1)
    }

    // 0 to 1
    log(val) {
        this.callback(val)
    }

}


