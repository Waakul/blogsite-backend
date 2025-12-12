import {Router} from "express";
import User from "../dbmodels/user.js";

const router = Router();

router.get("/", (req, res) => {
    const { query } = req.query;

    if (!query || query.trim() === "") {
        return res.status(400).json({ message: "Query parameter is required." });
    }

    const queryStr = query.toString();

    User.aggregate([
        {
          $match: {
            $or: [
              { username: { $regex: queryStr, $options: "i" } },
              { displayName: { $regex: queryStr, $options: "i" } }
            ]
          }
        },
        {
          // Compute a relevance score
          $addFields: {
            relevance: {
              $add: [
                // If username starts with query → big boost
                {
                  $cond: [
                    { $regexMatch: { input: "$username", regex: new RegExp("^" + queryStr, "i") } },
                    3,
                    0
                  ]
                },
                // If username contains query anywhere
                {
                  $cond: [
                    { $regexMatch: { input: "$username", regex: new RegExp(queryStr, "i") } },
                    2,
                    0
                  ]
                },
                // If displayName starts with query → medium boost
                {
                  $cond: [
                    { $regexMatch: { input: "$displayName", regex: new RegExp("^" + queryStr, "i") } },
                    2,
                    0
                  ]
                },
                // If displayName contains query
                {
                  $cond: [
                    { $regexMatch: { input: "$displayName", regex: new RegExp(queryStr, "i") } },
                    1,
                    0
                  ]
                }
              ]
            }
          }
        },
        {
          $sort: { relevance: -1 } // highest score first
        },
        {
          $limit: 10 // optional
        }
      ])
      .then((users) => {
          const result = users.map(user => ({
              username: user.username,
              displayName: user.displayName,
          }));
          res.json({ users: result });
      });
});

export default router;