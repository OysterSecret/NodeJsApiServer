const mongoose = require('mongoose');
const restful = require('node-restful');
const passport = require('passport');
var Types = mongoose.Schema.Types;

var PumpRoomSecond = restful.model('PumpRoomSecond',
  new mongoose.Schema({
    phIn: {type: Number, required: true},
    waterTemperIn: {type: Number, required: true},
    turbidityIn: {type: Number, required: true},
    amlN2In: {type: Number, required: true},
    codIn: {type: Number, required: true},
    tocIn: {type: Number, required: true},
    flowIn: {type: Number, required: true},
    phOut: {type: Number},
    waterTemperOut: {type: Number},
    turbidityOut: {type: Number},
    amlN2Out: {type: Number},
    codOut: {type: Number},
    tocOut: {type: Number},
    flowOut: {type: Number},
    pumps: [{
      order: {type: Number, required: true},
      frequency: Number,
      head: Number,
      flow: Number
    }]
  }, {
    versionKey: false,
    timestamps: { createdAt: 'createTime', updatedAt: 'updateTime' }
  }).index({createTime: -1}))
  .methods(['get', 'post', 'put', 'delete'])
  .before('get', passport.authenticate('bearer', { session: false }))
  .before('get', function(req, res, next) {
    if (req.query.sort === "-createTime" && isNaN(req.query.skip)) {
      var cache = PumpRoomSecond.lasted[req.query.limit];
      if (cache) {
        res.status(200).json(cache);
      } else {
        PumpRoomSecond.find()
          .limit(Number(req.query.limit))
          .sort(req.query.sort)
          .then(users => {
            PumpRoomSecond.lasted[req.query.limit] = users;
            res.status(200).json(users);
          })
          .catch(error => next(error));
      }
    } else {
      next();
    }
  })
  .before('post', passport.authenticate('bearer', { session: false }))
  .before('post', function(req, res, next) {
    return PumpRoomSecond
      .create(new PumpRoomSecond(req.body))
      .then(model => {
        var cacheMap = PumpRoomSecond.lasted;
        for(var field in cacheMap) {
          cacheMap[field].pop();
          cacheMap[field].unshift(model.toJSON());
        }
        res.status(201).json(model);
      })
      .catch(error => next(error));
  })
  .before('put', passport.authenticate('bearer', { session: false }))
  .before('delete', passport.authenticate('bearer', { session: false }));
PumpRoomSecond.lasted = {};

module.exports = PumpRoomSecond;
