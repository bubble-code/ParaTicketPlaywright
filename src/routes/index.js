const { db } = require("../firebase");
const { chromium } = require('playwright')
const sql = require('mssql');

const { Router, text } = require("express");
const router = Router();

router.get("/", async (req, res) => {
  try {
    const querySnapshot = await db.collection("users").get();
    const contacts = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    res.render("index", { contacts });
  } catch (error) {
    console.error(error);
  }
});


router.post("/new-contact", async (req, res) => {
  const { firstname, lastname, email, phone } = req.body;
  await db.collection("contacts").add({
    firstname,
    lastname,
    email,
    phone,
  });
  res.redirect("/");
});

router.get("/delete-contact/:id", async (req, res) => {
  await db.collection("contacts").doc(req.params.id).delete();
  res.redirect("/");
});

router.get("/edit-contact/:id", async (req, res) => {
  const doc = await db.collection("contacts").doc(req.params.id).get();
  res.render("index", { contact: { id: doc.id, ...doc.data() } });
});
// ----------------------------------------------------------
router.post("/update-contact/:id", async (req, res) => {
  const { firstname, lastname, email, phone } = req.body;
  const { id } = req.params;
  await db
    .collection("contacts")
    .doc(id)
    .update({ firstname, lastname, email, phone });
  res.redirect("/");
});


// -----------------------------------------------------------------------------
// Modulo Scraping Averias
// -----------------------------------------------------------------------------
; (async () => {
  const browser = await chromium.launch({ headless: false });
  const content = await browser.newContext({
    ignoreHTTPSErrors: true
  });
  const page = await content.newPage();
  await page.goto('http://otrs.dosniha.eu/osticket/scp/login.php');
  // Fill [placeholder="e-mail o nombre de usuario"]
  await page.fill('[placeholder="e-mail o nombre de usuario"]', 'Madrid');
  // Fill [placeholder="Contraseña"]
  await page.fill('[placeholder="Contraseña"]', 'madrid');
  // Click text=Inicia sesión
  await Promise.all([
    page.waitForNavigation('http://otrs.dosniha.eu/osticket/scp/index.php'),
    page.click('text=Inicia sesión')
  ]);
  // Click th >> nth=0
  const list = await page.$$('.list>tbody>tr')
  let tem = []
  const result = []
  for (const ele of list) {
    td = await ele.$$('td')
    id = await td[1].innerText();
    subject = await td[2].innerText();
    from = await td[3].innerText();
    date = await td[6].innerText();
    state = await td[7].innerText();
    result.push({ id, subject, from, date, state })
    // result[from] = (result[from] || 0) + 1
  }
  console.log(result);
  // ===========
  await browser.close()
  try {
    const listCollection = await db.collection("salones").doc("Madrid").collection("Salones").get();
    result.map(async function ({ id, subject, from, date, state }) {
      await db.collection("salones").doc("Madrid").collection("Salones").doc(from).collection("Averias").doc(id).set({
        subject,
        id,
        date,
        state
      });
    })
    // const salones = listCollection.map((coll) => {
    //   if (result.hasOwnProperty(coll.id)) {
    //     console.log(coll.id)
    //   }
    // });
  } catch (error) {
    console.error(error);
  }
})()
// -----------------------------------------------------------------------------
// Modulo Salones
// -----------------------------------------------------------------------------
// List of Halls
// -----------------------------------------------------------------------------
router.get("/listplayroom/:name", async (req, res) => {
  const nameComunidad = req.params.name;
  try {
    // const querySnapshot = await db.collection("salones").doc("Madrid").collection("Salones").doc('Salones').listCollections();
    const querySnapshot = await db.collection("salones").doc(nameComunidad).collection("Salones").listDocuments();
    const salones = querySnapshot.map((coll) => ({
      id: coll.id
    }));
    res.render("ListPlayRoom", { salones, nameComunidad });
    console.log({ salones });
  } catch (error) {
    console.error(error);
  }
})
// -----------------------------------------------------------------------------
// Add new Hall
// -----------------------------------------------------------------------------
router.post("/addHall/:nameComunidad", async (req, res) => {
  const { Name, ip, pass, user } = req.body;
  const { nameComunidad } = req.params;
  console.log({ Name, ip, pass, user, nameComunidad });

  try {
    const listObjetivos = await db.collection("salones").doc(nameComunidad).collection("Salones").doc(Name).set({
      ip,
      pass,
      user
    });
    res.redirect("/listplayroom/" + nameComunidad);
    // console.log({ detailsObject }); 
    // ---------------------------
  } catch (error) {
    console.error(error);
  }
  // -----------------------------
  // res.redirect("Objetivos", { detailsObject });

});
// ---------------------------------------------------------------------------
// Avisos
// ---------------------------------------------------------------------------
router.get("/avisos", async (req, res) => {
  try {
    // const querySnapshot = await db.collection("salones").doc("Madrid").collection("Salones").doc('Salones').listCollections();
    const querySnapshot = await db.collection("salones").doc("Madrid").collection("Avisos").listDocuments();
    const salones = querySnapshot.map((coll) => ({
      id: coll.id
    }));
    res.render("Avisos", { salones });
    console.log({ salones });
  } catch (error) {
    console.error(error);
  }
})
// -----------------------------------------------------------------------
// New Avisos
// -----------------------------------------------------------------------
router.post("/new-aviso", async (req, res) => {
  const { asunto, text } = req.body;
  await db.collection("salones").doc("Madrid").collection("Avisos").doc(asunto).set({
    asunto,
    text,
  });
  res.redirect("/avisos");
});
// -------------------------------------------------------------------------
// List of Objects
// -------------------------------------------------------------------------
router.get("/Objetivo/:id", async (req, res) => {
  console.log(req.params.id);
  try {
    const listObjetivos = await db.collection("salones").doc("Madrid").collection("Salones").doc(req.params.id).collection('Objetivos').get();
    // console.log(listObjetivos.docs.length)
    const detailsObject = listObjetivos.docs.map((elem) => ({
      id: elem.id, ...elem.data()
    }));
    res.render("Objetivos", { detailsObject, nameSalon: req.params.id });
    // console.log({ detailsObject });
  } catch (error) {
    console.error(error);
  }
  // res.redirect("Objetivos", { detailsObject });

});
// -----------------------------------------------------------------------------
// Add new Object
// -----------------------------------------------------------------------------
router.post("/addObject/:id", async (req, res) => {
  const { Mes, Target, Daily } = req.body;
  const { id } = req.params;
  console.log({ Mes, Target, Daily, id });
  // --------------------
  // router.post("/update-contact/:id", async (req, res) => {
  //   const { firstname, lastname, email, phone } = req.body;
  //   const { id } = req.params;
  //   await db
  //     .collection("contacts")
  //     .doc(id)
  //     .update({ firstname, lastname, email, phone });
  //   res.redirect("/");
  // });
  // -------------------------------
  try {
    const listObjetivos = await db.collection("salones").doc("Madrid").collection("Salones").doc(req.params.id).collection('Objetivos').doc(Mes).set({
      Target,
      Daily
    });
    // console.log(listObjetivos.docs.length)
    // const detailsObject = listObjetivos.docs.map((elem) => ({
    //   id: elem.id, ...elem.data()
    // }));
    res.redirect("/Objetivo/" + id);
    // console.log({ detailsObject }); 
  } catch (error) {
    console.error(error);
  }
  // res.redirect("Objetivos", { detailsObject });

});
// -----------------------------------------------------------------------------
// Module Gewete
// -----------------------------------------------------------------------------
router.get("/gewete/:nameCommunity", async (req, res) => {
  const nameComunidad = req.params.nameCommunity;
  const salones = [];
  try {
    // const querySnapshot = await db.collection("salones").doc("Madrid").collection("Salones").doc('Salones').listCollections();    
    const querySnapshot = await db.collection("salones").doc(nameComunidad).collection("Salones").get();
    querySnapshot.docs.forEach(ele => salones.push({ name: ele.id, ...ele.data() }));
    console.log(salones);
  } catch (error) {
    console.error(error);
  }
  console.log({ip:salones[2].ip, pass:salones[2].pass, names:salones[2].name});
  await connectSQL(salones[2].ip, salones[2].pass)

})
// -----------------------------------------------------------------------------
// Connect to mssql
// -----------------------------------------------------------------------------
const connectSQL = async (server, pass) => {
  const sqlConfig = {
    user: 'logs',
    password: pass,
    database: 'SIRUS',
    server: server,
    port: 51304,    
    options: {
      encrypt: false, // for azure
      trustServerCertificate: false // change to true for local dev / self-signed certs
    }
  }
  try {
    await new sql.ConnectionPool(sqlConfig);
    console.log("Conectado")
  } catch (err) {
    console.log(err);
  }
}

// -----------------------------------------------------------------------------
// Insert datas in firebase
// -----------------------------------------------------------------------------
//   const { firstname, lastname, email, phone } = re;
//   await db.collection("contacts").add({
//     firstname,
//     lastname,
//     email,
//     phone,
//   });
//   res.redirect("/");

// }



module.exports = router;
