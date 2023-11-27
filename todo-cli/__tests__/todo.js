const todoList = require("../todo");
const { all,
    add,
    markAsComplete,
    overdue,
    dueToday,
    dueLater,
    toDisplayableList } = todoList();
describe("todoList tests", () => {
    test("test that checks creating a new todo.", () => {
        let todoLength = all.length;
        add({ title: 'write home work', dueDate: new Date().toISOString(), completed: false });
        expect(all.length).toBe(todoLength + 1);
    });
    test("checks marking a todo as completed", () => {
        markAsComplete(0);
        expect(all[0].completed).toBe(true);
    });
    test("checks retrieval of overdue items", () => {
        const overdues = overdue();
        overdues.every((list) => {

            expect(list.dueDate < new Date()).toBe(true);
        });

    });
    test("checks retrieval of due today items.", () => {
        const Todaydues = dueToday();
         const today = new Date();
         today.setHours(0, 0, 0, 0);
        Todaydues.every((list) => {
            const dueDate = new Date(list.dueDate);
      dueDate.setHours(0, 0, 0, 0);
            expect(dueDate.toISOString() == today.toISOString()).toBe(true);
        })
        

    });
    test("checks retrieval of due later items.", () => {
         const laterdues = dueLater();
        laterdues.every((list) => {

            expect(list.dueDate > new Date()).toBe(true);
        });
    })
})