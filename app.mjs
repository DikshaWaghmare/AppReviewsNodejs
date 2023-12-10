
// app.mjs
import express from 'express';
import gplay from 'google-play-scraper';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.static('public')); // Serve static files from the 'public' folder

app.get('/appReviews', async (req, res) => {
    const { appId, reviewsCount } = req.query; // Get the 'appId' and 'reviewsCount' from the query parameters

    try {
        const appInfo = await gplay.app({ appId });
        let appReviews = await gplay.reviews({
            appId,
            sort: gplay.sort.NEWEST,
            num: parseInt(reviewsCount) || 20, // Convert reviewsCount to a number or default to 20
        });

        if (!Array.isArray(appReviews) && appReviews.data) {
            // If the response is in a different format, extract reviews
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
