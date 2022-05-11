import { Router } from 'express';
import countryList from "country-list";

const router = Router();

router.get('/', async function(req, res) {
  try {
    return res.status(200).send(countryList.getData());
  } catch (error) {
    console.error(error);
    return res.status(422).json({
      'message': "Cant get countries",
      error
    });
  }
});

export default router;
