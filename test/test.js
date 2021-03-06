//dependencies
var mongoose = require('mongoose');
//load all modules
require('./mongoose.js');
var Sample = mongoose.model('Sample');
var expect = require('chai').expect;
var async = require('async');
var samples;


describe('sequence value generator', function() {

    before(function() {
        samples = [{
            name: 'sample1'
        }, {
            name: 'Sample2'
        }, {
            name: 'Sample3'
        }, {
            name: 'Sample4'
        }];
    });

    it.skip('should be able to merge schema field definition with plugin specific field options', function(done) {
        done();
    });

    it.skip('should be able to exit with error if maximum save retries reached', function(done) {
        done();
    });


    it('should be able generate sequence value on save model instance', function(done) {
        var sample = new Sample({
            name: 'sample1'
        });

        sample.save(function(error, _sample) {

            expect(_sample).to.exist;
            expect(error).to.not.exist;
            expect(_sample.code).to.exist;
            expect(_sample.name).to.be.equal('sample1');

            done(error, _sample);
        });

    });

    it('should be able to do normal instance saving if code exists and instance already saved', function(done) {
        var sample = new Sample({
            name: 'sample1'
        });

        async.waterfall([
            function saveFirstTime(next) {
                sample.save(function(error, _sample) {

                    expect(_sample).to.exist;
                    expect(error).to.not.exist;
                    expect(_sample.code).to.exist;
                    expect(_sample.name).to.be.equal('sample1');

                    next(error, _sample);
                });
            },
            function saveSecondTime(_sample1, next) {
                _sample1.save(function(error, _sample2) {

                    expect(_sample1).to.exist;
                    expect(error).to.not.exist;
                    expect(_sample1.code).to.exist;
                    expect(_sample1.name).to.be.equal('sample1');

                    next(error, _sample1, _sample2);
                });
            }
        ], function(error, _sample1, _sample2) {

            expect(error).to.not.exist;
            expect(_sample1._id).to.be.equal(_sample2._id);
            expect(_sample1.code).to.be.equal(_sample2.code);

            done(error, _sample1, _sample2);

        });


    });

    it('should be able generate sequence value on model(s) creation', function(done) {

        Sample.create(samples.slice(0, 3), function(error, _samples) {
            expect(error).to.not.exist;
            expect(_samples.length).to.equal(3);
            done(error, _samples);
        });

    });


    it('should throw `error` when sequence field value reach greatest value possible', function(done) {

        Sample.create(samples, function(error, _samples) {

            expect(error).to.exist;

            done(null, _samples);
        });

    });


    afterEach(function(done) {
        Sample.remove(done);
    });


    after(function(done) {
        var cleanups = mongoose.modelNames()
            .map(function(modelName) {
                //grab mongoose model
                return mongoose.model(modelName);
            })
            .map(function(Model) {
                return async.series.bind(null, [
                    //clean up all model data
                    Model.remove.bind(Model),
                    //drop all indexes
                    Model.collection.dropAllIndexes.bind(Model.collection)
                ]);
            });

        //run all clean ups parallel
        async.parallel(cleanups, function(error) {
            if (error && error.message !== 'ns not found') {
                done(error);
            } else {
                done(null);
            }
        });
    });

});