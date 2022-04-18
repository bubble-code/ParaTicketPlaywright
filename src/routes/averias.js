import { db } from "../firebase";
import { Router } from 'express';

const routerAverias = Router();

// List Averias
routerAverias.get('/:comunidad/:salon', async (req, res) => {
  const salon = req.params.salon;
  const comunidad = req.params.comunidad;
  try {
    const querySnapshot = await db.collection("salones").doc(comunidad).collection("Salones").doc(salon).collection("Averias").get();
    const detailsObject = querySnapshot.docs.map((elem) => ({
      id: elem.id, ...elem.data()
    }));
    res.send({ detailsObject });
  } catch (error) {
    console.log(req.params.salon);
  }
});
// Todas las Averias
routerAverias.get('/:comunidad', async (req, res) => {
  const salon = req.params.salon;
  const comunidad = req.params.comunidad;
  const resAverias = [];
  try {
    const querySnapshot = await db.collection("salones").doc(comunidad).collection("Salones").listDocuments();
    for (const salon of querySnapshot) {
      const averiasSalon = await salon.collection("Averias").listDocuments();
      for (const averia of averiasSalon) {
        const data = await averia.get();
        resAverias.push({ salon: salon.id, ...data.data() });
      }
    }
    // Promise.allSettled(querySnapshot.map(async (elem) => await elem.collection("Averias").listDocuments()))
    //   .then(e => { console.log(e.length) })
    // console.log(result);
    res.send([...resAverias]);
  } catch (error) {
    console.log(req.params.salon);
  }
});

export default routerAverias