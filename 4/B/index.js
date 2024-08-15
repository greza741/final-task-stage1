const express = require(`express`)
const app = express()
const db = require(`./src/db`)
const { QueryTypes, NOW } = require(`sequelize`)
const { SELECT } = require("sequelize/lib/query-types")

const session = require(`express-session`)
const port = 3000


app.set(`view engine`, `hbs`)
app.set(`views`, `views`)
app.set("trust proxy", 1);

app.use(`/Assets`, express.static(`assets`))
app.use(express.urlencoded({ extended: true }))
app.use(express.json())
app.use(session({
    secret: `bapho`,
    cookie: {
        maxAge: 360000, secure: false, httpOnly: true
    },
    saveUninitialized: true,
    resave: false,
    store: new session.MemoryStore()
}))



// routing


app.get(`/`, renderHome)
app.get(`/edit-task`, renderEditTask)
app.post(`/addTask`, addTask)
app.get(`/login`, renderLogin)
app.post(`/login`, login)
app.get(`/register`, renderRegister)
app.post("/register", register)
app.get("/logout", logout)
app.get(`/add-collection`, renderAddCollection)
app.post(`/add-collection`, addCollection)
app.get(`/delete-collection/:collection_id`, deleteCollection)
app.get(`/delete-task/:task_id`, deleteTask)
app.get(`/edit-collection/:collection_id`, renderEditCollection)
app.post(`/edit-collection/:collection_id`, editColletion)
app.post('/update-task-status', updateTaskStatus)





async function renderHome(req, res) {
    try {
        const isLogin = req.session.isLogin
        // console.log(user);


        const query = `SELECT c.*, u.fullname
        FROM public.collection_tb c
        JOIN public.user_tb u ON c.user_id = u.id`
        const result = await db.query(query, {
            type: QueryTypes.SELECT
        })
        res.render(`home`, {
            data: result,
            isLogin: isLogin,
            user: req.session.user,
        })
    } catch (error) {
        res.redirect(`/login`)
    }

}
async function renderEditTask(req, res) {


    const isLogin = req.session.isLogin

    const query = `SELECT * FROM public.task_tb`
    const result = await db.query(query, {
        type: QueryTypes.SELECT
    })
    const countQuery = `
        SELECT 
            SUM(CASE WHEN is_done = true THEN 1 ELSE 0 END) AS done_count,
            SUM(CASE WHEN is_done = false THEN 1 ELSE 0 END) AS not_done_count,
            COUNT(*) AS all_task
        FROM public.task_tb`
    const countResult = await db.query(countQuery, {
        type: QueryTypes.SELECT
    });
    const doneCount = countResult[0].done_count
    const notDoneCount = countResult[0].not_done_count
    const allDone = notDoneCount == 0;
    const allTask = countResult[0].all_task
    if (isLogin) {
        res.render(`edit-task`, {
            data: result,
            isLogin: isLogin,
            user: req.session.user,
            doneCount: doneCount,
            notDoneCount: notDoneCount,
            allDone: allDone,
            allTask: allTask
        });
        return;
    }
    res.render(`login`)
}
async function addTask(req, res) {

    const user = req.session.user;
    const { name, is_done } = req.body;

    // console.log('Request Body:', req.body);

    const newTaskQuery = `
                INSERT INTO public.task_tb (name, is_done)
                VALUES ($1, $2);
            `;

    const values = [
        name,
        is_done || false
    ];

    const result = await db.query(newTaskQuery, {
        type: QueryTypes.INSERT,
        bind: values,
    });
    res.redirect('/edit-task');
}
async function deleteTask(req, res) {
    const id = req.params.task_id
    const deleteTask = `DELETE FROM public.task_tb
            WHERE id =${id};`
    await db.query(deleteTask)
    res.redirect(`/edit-task`)
}
function renderLogin(req, res) {
    res.render(`login`)
}
async function login(req, res) {
    try {
        const query = `
            SELECT * FROM public.user_tb
            WHERE email = $1
            AND password = $2`


        const existUser = await db.query(query, {
            type: QueryTypes.SELECT,
            bind: [req.body.email, req.body.password]
        })

        if (existUser.length === 0) {
            console.log(`gagal login`);

            return res.redirect(`/login`)
        }

        req.session.user = existUser[0]
        req.session.isLogin = true


        res.redirect(`/`)
    } catch (error) {
        console.log(error);
        res.redirect(`/login`)
    }
}
function renderRegister(req, res) {
    res.render(`register`)
}
async function register(req, res) {
    try {

        const query = `
        INSERT INTO public.user_tb
            (fullname, email, password)
        VALUES($1, $2, $3); `
        const values = [
            req.body.fullname,
            req.body.email,
            req.body.password,
        ]
        await db.query(query,
            {
                type: QueryTypes.INSERT,
                bind: values,
            })

        console.log(`succes`);
        res.redirect("/login")

    } catch (error) {
        console.log(`error`, error);
        res.redirect(`/register`)
    }
}
function renderAddCollection(req, res) {
    res.render(`add-collection`)
}
async function addCollection(req, res) {
    try {
        const user = req.session.user

        const newCollection = `
        INSERT INTO public.collection_tb(name,user_id)
            VALUES ($1,$2);`

        const values = [
            req.body.name,
            user.id
        ]

        await db.query(newCollection, {
            type: QueryTypes.INSERT,
            bind: values,
        })
        res.redirect(`/`)
    } catch (error) {
        console.log(error);
    }
}
async function renderEditCollection(req, res) {
    try {
        const collectionId = req.params.collection_id;
        const userId = req.session.user.id;

        const coll = await db.query(`
            SELECT * FROM public.collection_tb
            WHERE id = $1`, {
            bind: [collectionId],
            type: QueryTypes.SELECT
        });

        if (coll[0].user_id !== userId) {
            return res.redirect(`/`)
        }

        res.render('edit-collection', {
            data: coll[0]
        });
    } catch (error) {
        console.log(error);
    }
}
async function editColletion(req, res) {
    try {
        const collectionId = req.params.collection_id;
        const userId = req.session.user.id;

        const coll = await db.query(`
            SELECT user_id FROM public.collection_tb
            WHERE id = $1`, {
            bind: [collectionId],
            type: QueryTypes.SELECT
        });

        if (coll[0].user_id !== userId) {
            return res.redirect(`/`)
        }

        const newColl = `
            UPDATE public.collection_tb SET
            name = $1
            WHERE id = $2`;
        const values = [req.body.name, collectionId];

        await db.query(newColl, {
            bind: values
        });
        res.redirect('/');
    } catch (error) {
        console.log(error);
    }
}
async function deleteCollection(req, res) {
    try {
        const collectionId = req.params.collection_id;
        const userId = req.session.user.id;

        const coll = await db.query(`
            SELECT user_id FROM public.collection_tb
            WHERE id = $1`, {
            bind: [collectionId],
            type: QueryTypes.SELECT
        });

        if (coll[0].user_id !== userId) {
            return res.redirect(`/`)
        }

        const deleteCollectionQuery = `
            DELETE FROM public.collection_tb
            WHERE id = $1
        `;
        await db.query(deleteCollectionQuery, {
            bind: [collectionId]
        });

        res.redirect('/');
    } catch (error) {
        console.log(error);
    }
}
function logout(req, res) {
    req.session.destroy();
    res.redirect("/login");
}
async function updateTaskStatus(req, res) {
    try {
        const { task_id, is_done } = req.body

        const updateQuery = `
            UPDATE public.task_tb
            SET is_done = $1
            WHERE id = $2`
        const values = [is_done == 'true', task_id]

        await db.query(updateQuery, {
            bind: values
        });

        res.redirect('/edit-task');
    } catch (error) {
        console.log(error);
    }
}




// end routing

app.listen(port, () => {
    console.log(`Server berjalan di port ${port} `);
})
