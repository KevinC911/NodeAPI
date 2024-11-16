var express = require('express');
var app = express();
var port = '3000';
const pgp = require('pg-promise')();
const db = pgp('postgresql://formqtt_user:JczzxkQ8NIHwCfWesX0Kb1a3OkwiRuaF@dpg-csrd9gl6l47c73fcrehg-a.oregon-postgres.render.com/formqtt?ssl=true');

app.get('/get-data', async (req, res) => {
    const minutesDiff = req.query.datediff;
    const zoneDiff = req.query.zonediff;
    const topic = req.query.topic;

    try{
        let utcTime = new Date();
        utcTime.setMinutes(utcTime.getMinutes() + utcTime.getTimezoneOffset());
        let startDate = new Date();
        startDate.setMinutes(startDate.getMinutes() + utcTime.getTimezoneOffset());
        startDate.setMinutes(startDate.getMinutes() - (minutesDiff));

        const result = await db.any('SELECT * FROM mqtt_messages WHERE timestamp BETWEEN $1 AND $2 AND topic = $3', [startDate, utcTime, topic]);
        console.log(result);

        const modifiedDateResult = result.map(row => {
            const zonedDateTime = new Date(row.timestamp);
            zonedDateTime.setMinutes(zonedDateTime.getMinutes() - zoneDiff);
            return {
                ...row, 
                timestamp: zonedDateTime.toISOString(),  
            }
        });

        res.json(modifiedDateResult);
    } catch (err) {
        console.error(err);
        res.status(500).json({err: 'Database query failed'});
    }
})



app.listen(port, () => {
    console.log(`Server running on port ${port}`);
})