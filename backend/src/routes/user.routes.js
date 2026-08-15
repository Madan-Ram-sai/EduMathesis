import {Router} from 'express';

import {upload} from '../middlewares/upload.middleware.js';
import {verifyToken} from '../middlewares/verifyToken.middleware.js';
const router = Router();

router.route("/register").post(
    upload.fields([

    ]),
    registerUser
)
