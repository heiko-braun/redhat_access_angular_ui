'use strict';
/*global $ */
/*jshint camelcase: false*/
angular.module('RedhatAccess.cases').controller('RequestManagementEscalationModal', [
    '$scope',
    '$modalInstance',
    'AlertService',
    'CaseService',
    'strataService',
    '$q',
    '$stateParams',
    'RHAUtils',
    function ($scope, $modalInstance, AlertService, CaseService, strataService, $q, $stateParams, RHAUtils) {
        $scope.CaseService = CaseService;
        $scope.submittingRequest = false;
        $scope.disableSubmitRequest = true;
        $scope.submitRequestClick = angular.bind($scope, function (commentText) {
            $scope.submittingRequest = true;
            var promises = [];
            var fullComment = 'Request Management Escalation: ' + commentText;
            var postComment;
            if (CaseService.draftComment) {
                postComment = strataService.cases.comments.put(CaseService.kase.case_number, fullComment, false, CaseService.draftComment.id);
            } else {
                postComment = strataService.cases.comments.post(CaseService.kase.case_number, fullComment, true, false);
            }
            postComment.then(function (response) {
            }, function (error) {
                AlertService.addStrataErrorMessage(error);
            });
            promises.push(postComment);
            var caseJSON = { 'escalated': true };
            var updateCase = strataService.cases.put(CaseService.kase.case_number, caseJSON);
            updateCase.then(function (response) {
            }, function (error) {
                AlertService.addStrataErrorMessage(error);
            });
            promises.push(updateCase);
            var masterPromise = $q.all(promises);
            masterPromise.then(function (response) {
                CaseService.populateComments($stateParams.id).then(function (comments) {
                    $scope.closeModal();
                    $scope.submittingRequest = false;
                });
            }, function (error) {
                AlertService.addStrataErrorMessage(error);
            });
            return masterPromise;
        });
        $scope.closeModal = function () {
            CaseService.escalationCommentText = undefined;
            $modalInstance.close();
        };
        $scope.onNewEscalationComment = function () {
            if (RHAUtils.isNotEmpty(CaseService.escalationCommentText) && !$scope.submittingRequest) {
                $scope.disableSubmitRequest = false;
            } else if (RHAUtils.isEmpty(CaseService.escalationCommentText)) {
                $scope.disableSubmitRequest = true;
            }
        };
    }
]);
