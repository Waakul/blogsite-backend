import { Router } from 'express';
import Post from '../dbmodels/post.js';
import User from '../dbmodels/user.js';
import getUser from '../utils/getUser.js';

const router = Router();

router.get('/', async (req, res) => {
    try {
        const { sessionId } = req.cookies;
        let me = null;

        if (sessionId) {
            me = await getUser(sessionId);
        }

        // 1️⃣ Get all posts and populate user
        let allPosts = await Post.find({})
            .populate("user", "username displayName following") // note: 'user' field
            .lean();

        // 2️⃣ Build follower map
        const allUsers = await User.find({}, "following").lean();
        const followerMap = {};
        allUsers.forEach(u => {
            u.following.forEach(followedId => {
                const id = followedId.toString();
                followerMap[id] = (followerMap[id] || 0) + 1;
            });
        });

        // 3️⃣ Compute a score for each post
        allPosts = allPosts.map(p => {
            const followers = followerMap[p.user._id.toString()] || 0;
            const timestamp = new Date(p.dateofcreation).getTime();
            const followerBoost = followers * 60 * 60 * 1000; // 1 hour per follower
            const score = timestamp + followerBoost;
            return { ...p, score };
        });

        // 4️⃣ Sort by score descending
        allPosts.sort((a, b) => b.score - a.score);

        // 5️⃣ If logged in, put posts from users you follow on top
        if (me) {
            const followingIds = me.following.map(f => f.toString());
            allPosts.sort((a, b) => {
                const aFollowed = followingIds.includes(a.user._id.toString()) ? 1 : 0;
                const bFollowed = followingIds.includes(b.user._id.toString()) ? 1 : 0;
                if (aFollowed !== bFollowed) return bFollowed - aFollowed; // followed users first
                return b.score - a.score; // then by score
            });
        }

        // 6️⃣ Pagination (optional)
        const page = parseInt(req.query.page) || 1;
        const limit = 20;
        const start = (page - 1) * limit;
        const end = page * limit;
        const paginatedPosts = allPosts.slice(start, end);

        // Step 1: convert followerMap into an array
        const entries = Object.entries(followerMap); // [ [id, count], [id, count], ... ]

        // Step 2: sort by count descending
        entries.sort((a, b) => b[1] - a[1]);

        // Step 3: take top 10 IDs (in correct order)
        const top10Ids = entries.slice(0, 10).map(([id]) => id);

        // Step 4: query users (MongoDB returns random order)
        const topUsers = await User.find({ _id: { $in: top10Ids } })
            .select('username displayName')
            .lean();

        // Step 5: reorder based on follower count order
        const orderedTopUsers = top10Ids.map(id =>
            topUsers.find(u => u._id.toString() === id)
        ).filter(Boolean);

        res.json({
            success: true,
            page,
            hasMore: end < allPosts.length,
            posts: paginatedPosts,
            trendingUsers: orderedTopUsers,
        });


    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: "Server error" });
    }
});

export default router;