import { db } from "../firebase";
import { Router } from 'express';

const routerSalones = Router();

// List of Halls
// -----------------------------------------------------------------------------
routerSalones.get("/:name", async (req, res) => {
  const nameComunidad = req.params.name;
  try {
    // const querySnapshot = await db.collection("salones").doc("Madrid").collection("Salones").doc('Salones').listCollections();
    const querySnapshot = await db.collection("salones").doc(nameComunidad).collection("Salones").listDocuments();
    const salones = querySnapshot.map((coll) => ({
      id: coll.id
    }));
    res.send({ salones, nameComunidad });
    // res.render("ListPlayRoom", { salones, nameComunidad });
    console.log({ salones });
  } catch (error) {
    console.error(error);
  }

});
routerSalones.post("/", async (req, res) => {
  const { comunidad, ip, pass, user, location, cantMaqui, } = req.body;
  console.log({ comunidad, ip, pass, user, location, cantMaqui })
  await db.collection("salones").doc(comunidad).collection("Salones").add({ comunidad, ip, pass, user, location, cantMaqui });
});

export default routerSalones;