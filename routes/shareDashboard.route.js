const express = require ('express');
const router = express.Router();
const Dashboard = require('../schema/dashBoard.schema');
const User = require ('../schema/user.schema');
const jwt = require('jsonwebtoken');
const {auth} = require ('../middlewares/auth');
const crypto = require ('crypto');
const dotenv = require('dotenv');

dotenv.config();

const ensureLoggedIn = (req, res, next) => {

    if(!req.user) {
        return res.redirect('/signIn');
    }

    next();

}

router.post('/email', auth, async (req, res) => {
    const { dashBoardId, email, role} = req.body;

    if(!dashBoardId, !email, !role) {
        return res.status(400).json({
            message: 'Incomplete data for request'
        });
    }

    if (!['edit', 'view'].includes(role)){
        return res.status(400).json({message: 'Invalid role specified.'});
    }

    try{

        const targetUser = await User.findOne({email});

        if(!targetUser){
            return res.status(404).json({message: 'User not registered.'});
        }

        if (targetUser._id.toString() === req.user.id.toString()) {
            return res.status(400).json({
                message: 'Cannot be shared to owner.'
            });
        }        

        const dashboard = await Dashboard.findOne({ _id: dashBoardId, owner: req.user.id});


        if(!dashboard) {
            return res.status(403).json({message: 'Unauthorized'});
        }
  
        const alreadyShared = dashboard.sharedWith.some(
            (shared) => shared.user.toString() === targetUser._id.toString()
          );

            if(alreadyShared) {
                return res.status(400).json({message: 'Dashboard already shared with this user.'});
            }

            dashboard.sharedWith.push({
                user: targetUser._id,
                role
            });

            targetUser.sharedDashboards.push({
                dashboard: dashboard._id,
                role
            })


        await dashboard.save();
        await targetUser.save();

        return res.status(200).json({message: 'Dashboard shared successfully'});

    } catch (err) {
        console.log(err);
        return res.status(500).json({ message: 'Internal server error', error: err });

    }
});

router.post('/link', auth, async (req, res) => {

    const { dashBoardId, role } = req.body;

    if (!dashBoardId || !role) {
        return res.status(400).json({ message: 'Incomplete data for request' });
    }

    if (!['edit', 'view'].includes(role)) {
        return res.status(400).json({ message: 'Invalid role specified.' });
    }

    try{

        const dashboard = await Dashboard.findOne({ _id: dashBoardId, owner: req.user.id });

        if (!dashboard) {
            return res.status(403).json({ message: 'Unauthorized' });
        }

        const token = jwt.sign(
            {
                dashBoardId,
                role
            },
            process.env.JWT_SECRET,
            {
                expiresIn: '7d'
            }
        );

        const shareableLink = `${req.protocol}://${req.get('host')}/share/${token}`;

        return res.status(200).json({ link: shareableLink });

    } catch (err){
        console.log(err);
        return res.status(500).json({ message: 'Internal server error', error: err });

    }
});

router.get('/link/:token', async (req, res) => {

    const {token} = req.params;

    try{

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const {dashboardId, role} = decoded;

    const dashboard = await Dashboard.findById(dashboardId);
    if (!dashboard) {
        return res.status(404).json({ message: 'Dashboard not found' })
    };

        return res.status(200).json({
            dashboardId,
            role
        });

    } catch (err) {
        return res.status(500).json({
            message: 'Internal Server error',
            error: err
        });
    }
});

module.exports = router;