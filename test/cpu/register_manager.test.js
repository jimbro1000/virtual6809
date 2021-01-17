const Register_Manager = require("../../src/cpu/register_manager");
const Cpu_Register = require("../../src/cpu/cpu_register");
const cpus = require("../../src/cpu/cpu_constants");
const Control_Register = require("../../src/cpu/control_register");

describe("register manager", () => {
    it("provisions the full 6809 register set", () => {
        const sample = new Register_Manager.register_manager();

        const CC = sample.get("CC");
        expect(CC).toBeInstanceOf(Control_Register.control_register);
        expect(CC.size).toBe(cpus.SHORT);
        expect(CC.name).toBe("CC");
        expect(CC.control).toBeNull();
        const A = sample.get("A");
        expect(A).toBeInstanceOf(Cpu_Register.cpu_register);
        expect(A.size).toBe(cpus.SHORT);
        expect(A.name).toBe("A");
        expect(A.control).toBe(CC);
        const B = sample.get("B");
        expect(B).toBeInstanceOf(Cpu_Register.cpu_register);
        expect(B.size).toBe(cpus.SHORT);
        expect(B.name).toBe("B");
        expect(B.control).toBe(CC);
        const DP = sample.get("DP");
        expect(DP).toBeInstanceOf(Cpu_Register.cpu_register);
        expect(DP.size).toBe(cpus.SHORT);
        expect(DP.name).toBe("DP");
        expect(DP.control).toBe(CC);
        const X = sample.get("X");
        expect(X).toBeInstanceOf(Cpu_Register.cpu_register);
        expect(X.size).toBe(cpus.LONG);
        expect(X.name).toBe("X");
        expect(X.control).toBe(CC);
        const Y = sample.get("Y");
        expect(Y).toBeInstanceOf(Cpu_Register.cpu_register);
        expect(Y.size).toBe(cpus.LONG);
        expect(Y.name).toBe("Y");
        expect(Y.control).toBe(CC);
        const S = sample.get("S");
        expect(S).toBeInstanceOf(Cpu_Register.cpu_register);
        expect(S.size).toBe(cpus.LONG);
        expect(S.name).toBe("S");
        expect(S.control).toBe(CC);
        const U = sample.get("U");
        expect(U).toBeInstanceOf(Cpu_Register.cpu_register);
        expect(U.size).toBe(cpus.LONG);
        expect(U.name).toBe("U");
        expect(U.control).toBe(CC);
        const PC = sample.get("PC");
        expect(PC).toBeInstanceOf(Cpu_Register.cpu_register);
        expect(PC.size).toBe(cpus.LONG);
        expect(PC.name).toBe("PC");
        expect(PC.control).toBe(CC);
    });
});