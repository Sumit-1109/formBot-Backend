const jwt = require('jsonwebtoken');

const verifyRole = async(req, res, next) => {
    const {dashboardId} = req.params;

    try{
        const sharedDashboard = await SharedDashboard.findOne({
            dashboard: dashboardId
        });

        if(!sharedDashboard){
            return res.status(404).json({
                message: 'Dashboard not found'
            });
        }

        let userRole;

        if(req.user){
            const sharedEntry = sharedDashboard.sharedwith.find(entry => 
                entry.user?.toString() === req.user._id
            );
            userRole = sharedEntry?.role;
        }

        if(!userRole && req.headers.authorization){
            const token = req.headers.authorization;
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            if(decoded.dashboardId !== dashboardId){
                return res.status(403).json({
                    message: 'Invalid Link'
                });
            }
            userRole = decoded.role;
        }

        if(!userRole){
            return res.status(403).json({
                message: 'Access denied'
            })
        };

        req.role = userRole;
        next();

    } catch (err) {
        return res.status(500).json({
            message: 'Internal Server Error',
            error: err
        });
    }
}