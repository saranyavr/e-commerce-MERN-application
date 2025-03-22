import User from "../models/user.model.js";
import Order from "../models/order.model.js";

export const getAnalyticsData = async ()=>{
    const totalusers = await User.countDocuments();
    const totalProducts = await Product.countDocuments();
    const salesdata = await Order.aggregate([
        {
            $group:{
                _id:null, //it groups all documents togather
                totalSales: {$sum:1},
                totalRevenue: {$sum:"$tatolAmount"},



            }
        }

    ])

    const {totalSales, totalRevenue} = salesData[0] || {totalSales:0, totalRevenue:0};

    return {
        users:totalUsers, 
        processedOrders:totalProducts,
       totalSales, 
       totalRevenue}; 

};

export const getDailySalesData = async (startDate, endDate) =>{
    try{
        const dailySalesData = await Order.aggregate([
            {
                $match:{
                    createdAt: {
                        $gte: startDate,
                        $lte: endDate
                    }
                },
                $group: {
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                    totalSales: { $sum: 1 },
                    totalRevenue: { $sum: "$tatolAmount" }
                }   
            },
            { $sort: { _id: 1 } }
        ]);
        //example of dailysalesdata
        //{_id: 2022-11-11, totalSales: 1, totalRevenue: 100}
        const dateArray =  getDatesInRange(startDate, endDate);
        //console.log(dateArray);
        return dateArray.map(date =>{
            const foundData = dailySalesData.find(data => data._id === date);
            return {
                date,
                sales: foundData ? foundData.totalSales : 0,
                revenue: foundData ? foundData.totalRevenue : 0
            }
        })
        
            
    }catch(error){
        console.log("error in getting daily sales data", error.message);
        res.status(500).json({ message: "server error", error: error.message});

    }
};

    function getDatesInRange (satartDate, endDate) {
        const dates =[];
        let currentDate = new Date(startDate);

        while (currentDate <= endDate) {
            dates.push(currentDate.toISOString().split("T")[0]);
            currentDate.setDate(currentDate.getDate() + 1);
        }
        return dates;
    };