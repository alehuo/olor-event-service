var CONST = require('../constants');
var logger = require('../logger')(__filename);
var _ = require('lodash');
var eventService = require('../services/event-service');
var controllerUtils = require('./controller-utils');
var createJsonRoute = controllerUtils.createJsonRoute;
var validate = require('../services/service-utils').validate;
var authService = require('../services/auth-service');
var FORBIDDEN_MESSAGE = 'Forbidden. Author is not allowed to do the operation.';

var getEvents = createJsonRoute(function getEvents(req, res) {
    var params = {
        id:               req.params.id,
        creatorId:        req.query.creatorId,
        adminId:          req.query.adminId,
        categoryId:       req.query.categoryId,
        maxParticipants:  req.query.maxParticipants,
        curParticipants:  req.query.curParticipants,
        lat:              req.query.lat,
        long:             req.query.long,
        offset:           req.query.offset,
        limit:            req.query.limit
    };
    var serviceOpts = {};
    serviceOpts.includeAllFields = true;
    
    if (_.isArray(req.query.sort)) {
        params.sort = _.map(req.query.sort, controllerUtils.splitSortString);
    } else if (_.isString(req.query.sort)) {
        params.sort = [controllerUtils.splitSortString(req.query.sort)];
    }

    logger.info('operation=getEvents');
    logger.info('headers: ' + JSON.stringify(req.headers));
    return eventService.getEvents(params, serviceOpts)
    .then(function(result) {
        res.setHeader(CONST.HEADER_TOTAL_COUNT, result.totalCount);
        return result.data;
    });
});

var getEvent = createJsonRoute(function getEvent(req, res) {
    var serviceOpts = {};
    logger.info('operation=getEvent id=' + req.params.id);
    logger.info('headers: ' + JSON.stringify(req.headers));
    return eventService.getEvent(req.params.id, serviceOpts);
});

var postEvent = createJsonRoute(function postEvent(req, res) {
    var serviceOpts = {};
    var eventObj = {
        name:             req.body.name,
        description:      req.body.description,
        startTime:        req.body.startTime,
        duration:         req.body.duration,
        maxParticipants:  req.body.maxParticipants,
        curParticipants:  req.body.curParticipants,
        lat:              req.body.lat,
        long:             req.body.long,
        address:          req.body.address,
        creatorId:        req.body.creatorId,
        adminId:          req.body.adminId,
        reviewDeadline:   req.body.reviewDeadline,
        chatId:           req.body.chatId,
        categoryId:       req.body.categoryId
    };

    logger.info('operation=createEvent');
    logger.info('headers: ' + JSON.stringify(req.headers));
    return eventService.createEvent(eventObj);
});

var putEvent = createJsonRoute(function putEvent(req, res) {
    var eventId = req.params.id;

    return eventService.getEvent(eventId)
    .then(function(existingEvent) {
        var eventObj = {
            id:               req.body.id,
            name:             req.body.name,
            description:      req.body.description,
            startTime:        req.body.startTime,
            duration:         req.body.duration,
            maxParticipants:  req.body.maxParticipants,
            curParticipants:  req.body.curParticipants,
            lat:              req.body.lat,
            long:             req.body.long,
            address:          req.body.address,
            creatorId:        existingEvent.creatorId,
            adminId:          req.body.adminId,
            reviewDeadline:   req.body.reviewDeadline,
            chatId:           req.body.chatId,
            categoryId:       req.body.categoryId,
            createdAt:        existingEvent.createdAt
        };

        logger.info('operation=updateEvent eventId=' + eventId);
        logger.info('headers: ' + JSON.stringify(req.headers));
        return eventService.updateEvent(eventId, eventObj);
    });
});

var deleteEvent = createJsonRoute(function deleteEvent(req, res) {
    var eventId = req.params.id;

    return eventService.getEvent(eventId)
    .then(function(existingEvent) {
        logger.info('operation=deleteEvent eventId=' + eventId);
        logger.info('headers: ' + JSON.stringify(req.headers));
        return eventService.deleteEvent(eventId);
    })
    .then(function() {
        // If deletion succeeds, return undefined -> empty body
        return undefined;
    });
});

module.exports = {
    getEvents: getEvents,
    getEvent: getEvent,
    postEvent: postEvent,
    putEvent: putEvent,
    deleteEvent: deleteEvent
};
