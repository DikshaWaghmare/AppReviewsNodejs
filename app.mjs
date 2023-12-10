import express from 'express';
import gplay from 'google-play-scraper';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.static('public'));

app.get('/appReviews', async (req, res) => {
    const { appId, reviewsCount, customCount } = req.query;

    try {
        const appInfo = await gplay.app({ appId });

        let appReviews;
        if (reviewsCount === 'all') {
            appReviews = await gplay.reviews({
                appId,
                sort: gplay.sort.NEWEST,
                num: gplay.count.MAX,
            });
        } else if (reviewsCount === 'custom' && customCount) {
            const count = parseInt(customCount);
            appReviews = await gplay.reviews({
                appId,
                sort: gplay.sort.NEWEST,
                num: count,
            });
        } else {
            appReviews = await gplay.reviews({
                appId,
                sort: gplay.sort.NEWEST,
                num: 20, // Default to 20 reviews if count is not specified or invalid
            });
        }
        if (!Array.isArray(appReviews) && appReviews.data) {
            appReviews = appReviews.data;
        }

        if (appInfo && Array.isArray(appReviews)) {
            const appRating = appInfo.score;

            const reviewsData = appReviews.map((review) => ({
                appId,
                rating: appRating,
                username: review.userName,
                review: review.text,
            }));

            res.json({ appInfo, reviews: reviewsData });
        } else {
            res.status(404).json({ message: 'Failed to retrieve app information or reviews.' });
        }
    } catch (error) {
        res.status(500).json({ error: 'An error occurred while fetching data.' });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
