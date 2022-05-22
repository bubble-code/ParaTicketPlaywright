import { db } from "../firebase";
import { Router } from 'express';

const routerComunidades = Router();

// List Averias
routerComunidades.get('/', async (req, res) => { 
  //   const salon = req.params.salon;
  //   const comunidad = req.params.comunidad;
  const detailsObject = [];
  console.log("comunidades")
  try {
    const querySnapshot = await db.collection("salones").listDocuments();
    for (const item of querySnapshot) {
      const data = item.id;
      detailsObject.push({ data });
    }
    // const detailsObject = querySnapshot.map((elem) => ({
    //   id: elem.id, ...elem.data()
    // }));
    res.send([...detailsObject]);
  } catch (error) {
    console.log(error);
  }
});
export default routerComunidades