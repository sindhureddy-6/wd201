const todoList = require("../todo");
const { all,
    add,
    markAsComplete,
    overdue,
    dueToday,
    dueLater,
    toDisplayableList } = todoList();
describe("todoList tests", () => {
    

    beforeAll(() => {
        add({ title: 'new todo', dueDate: new Date().toLocaleDateString("en-CA"), completed: false });

    });
    test("test that checks creating a new todo.", () => {
        let todoLength = all.length;
        add({ title: 'write home work', dueDate: new Date().toLocaleDateString("en-CA"), completed: false });
        expect(all.length).toBe(todoLength + 1);
    });
    test("checks marking a todo as completed", () => {
        expect(all[0].completed).toBe(false);
        markAsComplete(0);
        expect(all[0].completed).toBe(true);
    });
    test("checks retrieval of overdue items", () => {
        const overDueTodoItemsCount = overdue().length
        // add the over due task
        add({ title: 'write home work', dueDate: new Date(new Date().setDate(new Date().getDate() - 1)).toLocaleDateString("en-CA"), completed: false })
        expect(overdue().length).toEqual(overDueTodoItemsCount + 1);

    });
    test("checks retrieval of due today items.", () => {
        const todayTodoItemsCount = dueToday().length
        // add the Today due task
        add({ title: 'write home work', dueDate: new Date().toLocaleDateString("en-CA"), completed: false })
        expect(dueToday().length).toEqual(todayTodoItemsCount + 1);

    });
    test("checks retrieval of due later items.", () => {
        const LaterdueTodoItemsCount = dueLater().length
        // add the later due task
        add({ title: 'write home work', dueDate: new Date(new Date().setDate(new Date().getDate() + 1)).toLocaleDateString("en-CA"), completed: false })
        expect(dueLater().length).toEqual(LaterdueTodoItemsCount + 1);
    })
});