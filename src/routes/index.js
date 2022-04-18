import { db } from "../firebase";
import { Router, text } from 'express';
import { chromium } from 'playwright';
import sql from 'mssql';
// const { chromium } = require('playwright')
// const sql = require('mssql');

// const { Router, text } = require("express");
// const { Promise } = require("mssql/lib/base");
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
  await scraping("Madrid", "Madrid", "madrid");
  await scraping("Mallorca", "Mallorca", "mallorca");
  await scraping("Cantabria", "Cantabria", "cantabria");
  await scraping("Navarra", "Navarra", "navarra");
})()

async function scraping(salon, user, pass) {
  const browser = await chromium.launch({ headless: false });
  const content = await browser.newContext({
    ignoreHTTPSErrors: true
  });
  const page = await content.newPage();
  await page.goto('http://otrs.dosniha.eu/osticket/scp/login.php');
  // Fill [placeholder="e-mail o nombre de usuario"]
  await page.fill('[placeholder="e-mail o nombre de usuario"]', `${user}`);
  // Fill [placeholder="Contraseña"]
  await page.fill('[placeholder="Contraseña"]', `${pass}`);
  // Click text=Inicia sesión
  await Promise.all([
    page.waitForNavigation('http://otrs.dosniha.eu/osticket/scp/index.php'),
    page.click('text=Inicia sesión')
  ]);
  // Click th >> nth=0
  const list = await page.$$('.list>tbody>tr')
  // console.log(list);
  let tem = []
  const result = []
  for (const ele of list) {
    let td = await ele.$$('td')
    let id = await td[1].innerText();
    let subject = await td[2].innerText();
    let from = await td[3].innerText();
    let date = await td[6].innerText();
    let state = await td[7].innerText();
    result.push({ id, subject, from, date, state })
    // result[from] = (result[from] || 0) + 1
  }
  const listAverPorSalon = []
  result.forEach(currSalon => {
    const nombSalon = currSalon.from;
    if (!listAverPorSalon[nombSalon])
      listAverPorSalon[nombSalon] = [];
    listAverPorSalon[nombSalon].push(currSalon)

  })
  // console.log(listAverPorSalon);
  // console.log("============================================================");
  // console.log(result);
  // ===========
  await browser.close()
  try {
    const colletionSalones = await db.collection("salones").doc(salon).collection("Salones").listDocuments();
    for (const ele of colletionSalones) {
      const listAve = await ele.collection("Averias").listDocuments();
      listAve.forEach(async dd => await dd.delete());
    }

    result.forEach(async function ({ id, subject, from, date, state }) {
      await db.collection("salones").doc(salon).collection("Salones").doc(from).collection("Averias").doc(id).set({
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
}
// -----------------------------------------------------------------------------
// Modulo Salones
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
  const result = [];
  try {
    // const querySnapshot = await db.collection("salones").doc("Madrid").collection("Salones").doc('Salones').listCollections();    
    const querySnapshot = await db.collection("salones").doc(nameComunidad).collection("Salones").get();
    querySnapshot.docs.forEach(ele => salones.push({ name: ele.id, ...ele.data() }));
    // console.log(salones);
    Promise.all(
      salones.map(async (val, index) => await connectSQL(val.ip, val.pass, val.name))
    ).then(function (listPromise) {
      for (const item of listPromise) {
        result.push(item);
      }
      console.log(...result);
      res.render("Gewetes", { result, nameComunidad })
    })
  } catch (error) {
    console.error(error);
  }

})
// -----------------------------------------------------------------------------
// Connect to mssql
// -----------------------------------------------------------------------------
const connectSQL = async (server, pass, name) => {
  let result;
  const sqlConfig = {
    user: 'logs',
    password: pass,
    database: 'SIRIUS',
    server: server,
    port: 51304,
    options: {
      encrypt: false, // for azure
      trustServerCertificate: false, // change to true for local dev / self-signed certs
      cryptoCredentialsDetails: {
        minVersion: 'TLSv1'
      }
    }
  }

  const co = new sql.ConnectionPool(sqlConfig);
  try {
    const e = await co.connect();
    const resu = await e.request().query(
      `SELECT LTI_FROM AS TYPE, SUM(LTI_AMOUNT) AS TOTAL FROM LOG_TICKET WHERE LTI_PAYOUT_DATE IS NOT NULL GROUP BY LTI_FROM ORDER BY LTI_FROM;
    SELECT CAST(LCR_DENOMINATION_VALUE AS FLOAT) AS TYPE, SUM(LCR_STOCK) AS CANT,CAST(LCR_DENOMINATION_VALUE AS FLOAT) * SUM(LCR_STOCK) AS VALUE FROM LOG_CURRENT_LEVEL WHERE LCR_STOCK > 0 AND LCR_SHELF_CHANNEL_TYPE <> 'input' GROUP BY LCR_DENOMINATION_VALUE ORDER BY LCR_DENOMINATION_VALUE DESC;
    SELECT LCR_DENOMINATION_VALUE AS TYPE, SUM(LCR_STOCK)* LCR_DENOMINATION_VALUE AS VALUE, SUM(LCR_STOCK) AS CANT FROM LOG_CURRENT_LEVEL WHERE LCR_SHELF_CHANNEL_TYPE='INPUT' AND LCR_STOCK > 0 GROUP BY LCR_DENOMINATION_VALUE ORDER BY LCR_DENOMINATION_VALUE DESC`);
    return ({
      name,
      TICKET: resu.recordsets[0],
      STOCK: resu.recordsets[1],
      CASHBOX: resu.recordsets[2],
    });
  } catch (err) {
    return console.log(err);
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



export default router;


