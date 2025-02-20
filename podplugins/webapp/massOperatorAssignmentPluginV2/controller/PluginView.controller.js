sap.ui.define(
  [
    'sap/ui/model/json/JSONModel',
    'sap/dm/dme/podfoundation/controller/PluginViewController',
    'sap/base/Log',
    'sap/m/MessageBox',
    '../util/ErrorHandler',
    '../util/formatter'
  ],
  function(JSONModel, PluginViewController, Log, MessageBox, ErrorHandler, formatter) {
    'use strict';

    var oLogger = Log.getLogger('massOperatorAssignmentPlugin', Log.Level.INFO);

    var oPluginViewController = PluginViewController.extend('arun.ext.podplugins.massOperatorAssignmentPluginV2.controller.PluginView', {
      metadata: {
        properties: {}
      },

      formatter: formatter,

      onInit: function() {
        if (PluginViewController.prototype.onInit) {
          PluginViewController.prototype.onInit.apply(this, arguments);
        }

        // this.fetchAndBindData();

        this.initialViewModelData = {
          isNew: false, // Ensure select is enabled
          resourceList: [], // Initialize empty array
          isFiltersApplied: false,
          isDirty: false,
          autoAcceptance: 'auto', // Set default selection to "Automatic"
          correctionTime: 3000, // Default Correction Time
          acceptanceDelay: 1, // Default Acceptance Delay
          tableHeaderBtn: {
            assign: {
              enabled: false
            },
            revoke: {
              enabled: false
            },
            add: {
              enabled: false
            },
            remove: {
              enabled: false
            }
          },
          lineItems: [],
          workCenters: []
        };

        this.materialsList = {};
        this.workCenters = {};
        this.getView().setModel(new JSONModel({...this.initialViewModelData}), 'viewModel');
        this.getView().setModel(new JSONModel([]), 'resourceData');
        this.getView().setModel(new JSONModel({}), 'orderData');
        this.getView().setModel(new JSONModel([]), 'recipeData');
        this.getView().setModel(new JSONModel([]), 'grModel');
      },

      onBeforeRenderingPlugin: function() {
        this.PPD_BASE_URL = this.getPublicApiRestDataSourceUri() + '/pe/api/v1/process/processDefinitions/start?';
      },

      onBeforeRendering: function() {},

      onAfterRendering: function() {},

      onExit: function() {
        if (PluginViewController.prototype.onExit) {
          PluginViewController.prototype.onExit.apply(this, arguments);
        }
      },

      onClearFilterbarBtnPress: function() {
        var oView = this.getView();

        // Clear filter inputs
        oView.byId('idOrderFilterInput').setValue('');
        oView.byId('idSFCSelect').setSelectedKey(null);

        this.getView().byId('idOrderFilterInput').setEditable(true);
        this.getView().byId('idSFCSelect').setEditable(true);

        this._resetModels();

        // Reset the filter bar state if required
        var oFilterBar = oView.byId('idFilterBar');
        if (oFilterBar) {
          oFilterBar.fireClear();
        }
      },

      onOrderInputChange: function(oEvent) {
        var sOrderId = oEvent.getParameter('newValue');
        this._loadOrderData(sOrderId);
      },

      onSFCSelectionChange: async function(oEvent) {
        var sSFC = oEvent.getSource().getSelectedKey();
        this.selectedSFC = sSFC;

        await this._getSfcData().then(oData => {
          if (oData.status.description !== 'ACTIVE') {
            var oSfcInput = this.getView().byId('idSFCSelect');
            oSfcInput.setValueState('Error');
            oSfcInput.setValueStateText(`SFC ${sOrderId} is not in active status`);
            return;
          }
        });
      },

      onFBSearch: function(oEvent) {
        var oFilterBar = oEvent.getSource();
        var oViewModel = this.getView().getModel('viewModel');
        var sOrderId = this.getView().byId('idOrderFilterInput').getValue();
        var sSFC = this.getView().byId('idSFCSelect').getSelectedKey();

        if (!sOrderId || !sSFC) {
          if (!sOrderId) {
            this.getView().byId('idOrderFilterInput').setValueState('Error');
            this.getView().byId('idOrderFilterInput').setValueStateText('Please enter an Order Number');
          }

          if (!sSFC) {
            this.getView().byId('idSFCSelect').setValueState('Error');
            this.getView().byId('idSFCSelect').setValueStateText('Please select an SFC');
          }

          return;
        }

        // Reset ValueState only when both inputs are valid
        this.getView().byId('idOrderFilterInput').setValueState('None');
        this.getView().byId('idSFCSelect').setValueState('None');

        // Show the footer
        oViewModel.setProperty('/isFiltersApplied', true);

        this._getSfcData().then(oData => {
          if (oData.status.description === 'ACTIVE') {
            this.getView().byId('idOrderFilterInput').setEditable(false);
            this.getView().byId('idSFCSelect').setEditable(false);
            // Fetch data
            this._getAssignmentData();
          } else {
            MessageBox.error(`Order number ${sOrderId} is not in active status`);
            return;
          }
        });
      },

      onSavePress: function(oEvent) {
        var oView = this.getView(),
          oViewModel = oView.getModel('viewModel'),
          aLineItems = oViewModel.getProperty('/lineItems'),
          oOrderModel = oView.getModel('orderData'),
          oOrderData = oOrderModel.getProperty('/');

        var aPayload = aLineItems.map(oItem => {
          return {
            active: oItem.InActive,
            resource: oItem.resource,
            correctionTime: oItem.correctionTime,
            acceptanceDelay: oItem.acceptanceDelay,
            plant: oOrderData.plant,
            material: oOrderData.material.material,
            seatNumber: oItem.InSeatNumber,
            component: oItem.component,
            operator: oItem.operator,
            workcenter: oItem.workCenter
          };
        });

        var sUrl = 'https://dbapicall.cfapps.eu20-001.hana.ondemand.com/api/massUpdate/assignenmentDetails';

        return new Promise((resolve, reject) => {
          this.ajaxPostRequest(sUrl, aPayload, resolve, reject);
        }).then(aData => {
          //TODO: Decouple
          this.onCancelAssignmentsPress();
        });
      },

      onTableItemsSelectionChange: function(oEvent) {
        var aSelectedRows = oEvent.getParameter('listItems');
        console.log(aSelectedRows);
      },

      //TODO: Recheck
      onAssignedOperatorIdChange: function(oEvent) {
        var oControl = oEvent.getSource(),
          dupComponent,
          resource;

        var sNewOperator = oControl.getValue().trim();
        var oViewModel = this.getView().getModel('viewModel');
        var aLineItems = oViewModel.getProperty('/lineItems');

        var oLineItemContext = oControl.getBindingContext('viewModel');
        var oLineItemData = oLineItemContext.getObject();
        var sOperatorId = oControl.getValue();
        var aResourceList = this.getView().getModel('resourceData').getData();
        var sCurrentPath = oLineItemContext.getPath();

        // Check if operator is already assigned in another row
        var bDuplicate = aLineItems.some(function(oItem, index) {
          var sItemPath = '/lineItems/' + index;
          if (sItemPath !== sCurrentPath && oItem.operator === sNewOperator) {
            dupComponent = oItem.component;
            resource = oItem.resource;
          }
          return sItemPath !== sCurrentPath && oItem.operator === sNewOperator;
        });

        if (bDuplicate) {
          sap.m.MessageBox.error(`${sNewOperator} is already assigned to component ${dupComponent}, ${resource}`);
          // sap.m.MessageBox.error("This operator is already assigned to another row. Please select a different operator.");
          oControl.setValue(''); // Reset input field
        }

        this._markItemAsDirty(oLineItemContext);

        ErrorHandler.clearErrorState(oControl);

        //If resource selection is made and no operator id is set, show error
        if (!sOperatorId && oLineItemData.resource) {
          ErrorHandler.setErrorState(oControl, this.getI18nText('requiredFieldErrMsg'));
          return;
        }

        this._getOperatorOccupancy(sOperatorId).then(
          function(oResponse) {
            //If outOperator array is empty, then operator does not have another assignment. No error
            if (oResponse.outOperator.length === 0) {
              return;
            }

            //outOperator array is not empty. Operator is already assigned. Show error
            ErrorHandler.setErrorState(
              oControl,
              this.getI18nText('operatorAssignedToOtherResourceErrMsg', [sOperatorId, oResponse.outOperator[0].RESOURCE])
            );
          }.bind(this)
        );
      },

      //TODO: Update checks and validations
      onAssignedResourceChanged: async function(oEvent) {
        var oControl = oEvent.getSource(),
          oViewModel = this.getView().getModel('viewModel');

        //!When does this trigger?
        if (!oControl) {
          console.error('onAssignedResourceChanged: No source control found.');
          return;
        }

        var oSelectedContext = oControl.getBindingContext('viewModel');

        //!When does this trigger?
        if (!oSelectedContext) {
          console.error('onAssignedResourceChanged: No binding context found.');
          return;
        }

        var oSelectedRowData = oSelectedContext.getObject();

        //!This row should not have been editable.
        // Check if unitOfMeasure is not "KG" or "G", then disable the entire row
        // var isNew = oSelectedRowData.unitOfMeasure === 'KG' || oSelectedRowData.unitOfMeasure === 'G';
        // oViewModel.setProperty(oSelectedContext.getPath() + '/isNew', isNew);

        if (oSelectedRowData.isBomRelevant && !oSelectedRowData.isUnitValid) {
          sap.m.MessageToast.show('Component is not scalable');
          oViewModel.setProperty(oSelectedContext.getPath() + '/isNew', oSelectedRowData.isUnitValid);
          return; // Exit if the row is disabled
        }

        // Normal resource assignment logic continues here if the unit of measure is "KG" or "G"

        var oSelectedItem = oEvent.getParameter('selectedItem');
        if (!oSelectedItem) {
          console.error('onAssignedResourceChanged: No selected item found.');
          return;
        }

        var oResourceData = oSelectedItem.getBindingContext('viewModel').getObject();
        if (!oResourceData) {
          console.error('onAssignedResourceChanged: No resource data found.');
          return;
        }

        /////////////////////////
        //!Duplicate check needs to be revisited
        var aLineItems = oViewModel.getProperty('/lineItems'),
          dupComponent;
        var sNewResource = oSelectedItem.getKey();
        var sCurrentPath = oControl.getBindingContext('viewModel').getPath();
        var bDuplicate = aLineItems.some(function(oItem, index) {
          var sItemPath = '/lineItems/' + index;
          if (sItemPath !== sCurrentPath && oItem.resource === sNewResource) {
            dupComponent = oItem.component;
          }
          return sItemPath !== sCurrentPath && oItem.resource === sNewResource;
        });

        if (bDuplicate) {
          sap.m.MessageBox.error(`${sNewResource} is already assigned to component ${dupComponent}.`);
          oControl.setSelectedKey(''); // Reset Select field
          return;
        }
        ///////////////////////////////////

        var oOrderData = this.getView().getModel('orderData').getData();
        var selectedObject = oControl.getBindingContext('viewModel').getObject();
        var oPayload = {
          InMaterial: selectedObject.component,
          InOrder: oOrderData.order,
          InPlant: oOrderData.plant,
          InMaterialVersion: selectedObject.componentVersion
        };
        this._getManagedBatchData(oPayload).then(data => {
          if (!data.outInventoryId) {
            oControl.setSelectedKey(''); // Reset Select field
            MessageBox.error('The selected component is not batch managed.');
            return;
          }

          this._markItemAsDirty(oSelectedContext);

          ErrorHandler.clearErrorState(oControl, 'selectedKey');

          // Get allowed statuses for resource assignment
          var aAllowedStatuses = this.getConfiguration().allowedResourceStatusesForAssignment.reduce((acc, val) => {
            if (val.value) acc.push(val.key);
            return acc;
          }, []);

          // Validate resource status
          if (!aAllowedStatuses.includes(oResourceData.status)) {
            ErrorHandler.setErrorState(oControl, this.getI18nText('resourceStatusInvalidErrMsg', [oResourceData.status]), 'selectedKey');
            return;
          }

          this._getResourceOccupancy(oResourceData.resource)
            .then(oResourceOccupancy => {
              if (oResourceOccupancy['State_Signal'] !== 0) {
                ErrorHandler.setErrorState(
                  oControl,
                  this.getI18nText('resourceHasExistingOperatorAssignmentErrMsg', [
                    oResourceData.resource,
                    oResourceOccupancy.OperatorName
                  ]),
                  'selectedKey'
                );

                return;
              }

              // Auto-Populate Fields
              oViewModel.setProperty(oSelectedContext.getPath() + '/resourceType', oResourceData.types);

              // oViewModel.setProperty(oSelectedContext.getPath() + '/operator', oResourceData.operator || '');
              if (oResourceData.operator) oViewModel.setProperty(oSelectedContext.getPath() + '/operator', oResourceData.operator);
              oViewModel.setProperty(oSelectedContext.getPath() + '/lastModified', this.dateTimeFormatter(oResourceData.lastModified));

              // Set selected resource to line item
              this._setLineItemResourceData(oViewModel, oSelectedContext.getPath(), oResourceData);
            })
            .catch(oError => {
              ErrorHandler.setErrorState(oControl, this.getI18nText('invalidResource'), 'selectedKey');
              MessageBox.error(this.getI18nText('couldNotFetchResourceOccupancy', [oResourceData.resource]));
            });
        });
      },

      onAutoAcceptanceDelayChange: function(oEvent) {
        var oContext = oEvent.getSource().getBindingContext('viewModel');
        this._markItemAsDirty(oContext);
      },

      onCorrectionTimeInputChange: function(oEvent) {
        var oContext = oEvent.getSource().getBindingContext('viewModel');
        this._markItemAsDirty(oContext);
      },

      onAutoAcceptanceModeChange: function(oEvent) {
        var oViewModel = this.getView().getModel('viewModel'),
          oContext = oEvent.getSource().getBindingContext('viewModel'),
          sPath = oContext.getPath(),
          oSelectedRowData = oViewModel.getProperty(sPath),
          sSelectedKey = oEvent.getSource().getSelectedKey();

        if (sSelectedKey === 'auto') {
          oSelectedRowData.autoAcceptance = true;
        } else {
          oSelectedRowData.autoAcceptance = false;
          oSelectedRowData.acceptanceDelay = 1; //TODO: Get from configuration info
        }

        oViewModel.setProperty(sPath, oSelectedRowData);
        this._markItemAsDirty(oContext);
      },

      onCancelAssignmentsPress: function(oEvent) {
        this._getAssignmentData(this.selectedOrder.order);
        this.getView().getModel('viewModel').setProperty('/isDirty', false);
      },

      onSaveAssignmentsPress: function(oEvent) {
        var oViewModel = this.getView().getModel('viewModel');
        var aItems = oViewModel.getProperty('/lineItems');

        if (ErrorHandler.hasErrors()) {
          return MessageBox.error(this.getI18nText('fixErrorsBeforeSaveErrMsg'));
        }

        //Validate table items
        var oTable = this.getView().byId('idMassOpAsmtTable');
        oTable.getItems().filter(oItem => oItem instanceof sap.m.ColumnListItem).forEach(oItem => {
          var oData = oItem.getBindingContext('viewModel').getObject(),
            aCells = oItem.getCells();

          if (!oData.isDirty && !oData.isNew) {
            return;
          }

          if (!oData.resource && !oData.operator) {
            return;
          }

          if (!oData.resource) {
            ErrorHandler.setErrorState(aCells[3], this.getI18nText('requiredFieldErrMsg'), 'selectedKey');
          }

          if (!oData.operator) {
            ErrorHandler.setErrorState(aCells[5], this.getI18nText('requiredFieldErrMsg'));
          }

          if (oData.autoAcceptance && parseInt(oData.acceptanceDelay) < 1) {
            ErrorHandler.setErrorState(aCells[7], this.getI18nText('inputPositiveNonZeroErrMsg'));
          }
        });

        if (ErrorHandler.hasErrors()) {
          return MessageBox.error(this.getI18nText('fixErrorsBeforeSaveErrMsg'));
        }
        var oOperatorMap = {}; // Store operator occurrences
        var bHasDuplicates = false;

        for (var i = 0; i < aItems.length; i++) {
          var sOperator = aItems[i].operator;

          if (sOperator) {
            if (oOperatorMap[sOperator]) {
              bHasDuplicates = true;
              break; // Exit loop early if duplicate found
            }
            oOperatorMap[sOperator] = true;
          }
        }

        if (bHasDuplicates) {
          MessageBox.error('Duplicate operator detected! Please assign a different operator in each row.');
          return; // Stop execution
        }

        var aItemsForServiceCall = aItems.filter(oItem => oItem.isDirty);
        this._saveResourceAssignments(aItemsForServiceCall);
      },

      onRevokeResouceBtnPress: function(oEvent) {
        var oTable = this.getView().byId('idMassOpAsmtTable'),
          aSelectedItems = oTable.getSelectedItems();

        var aItemsForServiceCall = aSelectedItems.reduce((acc, oItem) => {
          var oSelectedRowData = oItem.getBindingContext('viewModel').getObject();
          var sPath = oItem.getBindingContext('viewModel').getPath();

          if (!oSelectedRowData.resource) return acc;

          acc.push({
            resource: oSelectedRowData.resource,
            path: sPath
          });
          return acc;
        }, []);

        var aPromises = aItemsForServiceCall.map(oItem => {
          var oViewModel = this.getView().getModel('viewModel');
          return this._revokeResource(oItem.resource).then(
            function() {
              this._setLineItemResourceData(oViewModel, oItem.path, {}, true);
            }.bind(this)
          );
        });

        // var aPromises = aSelectedItems.map(
        //   function(oItem) {
        //     var oViewModel = this.getView().getModel('viewModel');
        //     var oSelectedRowData = oItem.getBindingContext('viewModel').getObject();
        //     var sPath = oItem.getBindingContext('viewModel').getPath();

        //     return this._revokeResource(oSelectedRowData.resource)
        //       .then(
        //         function() {
        //           this._setLineItemResourceData(oViewModel, sPath, {}, true);
        //         }.bind(this)
        //       )
        //       .catch(oError => {
        //         aErrors.push(oSelectedRowData.resource);
        //       });
        //   }.bind(this)
        // );

        Promise.allSettled(aPromises).then(
          function(aResponses) {
            oTable.removeSelections(true);
          }.bind(this)
        );
      },

      onAddResouceBtnPress: function(oEvent) {
        // Get the context of the selected row from the event

        var oSelectedRowContext = oEvent.getSource().getBindingContext('viewModel');
        var oSelectedRowData = oSelectedRowContext.getObject();
        var aSameComponent = this.getView().getModel('viewModel').getProperty('/lineItems').filter(oItem => {
          return oItem.component === oSelectedRowData.component;
        });

        // Create a new row with the same component details
        var oNewRowItem = {
          ...oSelectedRowData, // Copy the component details
          isDirty: true,
          isNew: true,
          asset: '',
          resource: '',
          resourceType: '',
          operator: '',
          autoAcceptance: true,
          acceptanceDelay: 1,
          correctionTime: 3000,
          lastModified: '',
          InSeatNumber: aSameComponent[0].InSeatNumber + aSameComponent.length,
          InActive: 0
        };

        // Add the new row to the line items
        var oModel = oSelectedRowContext.getModel();
        var aLineItems = oModel.getProperty('/lineItems');
        aLineItems.push(oNewRowItem);

        // Update the model
        oModel.setProperty('/lineItems', aLineItems);
        oModel.refresh(true);
      },

      onClearResourceBtnPress: function(oEvent) {
        // Get the context of the selected row from the event
        var oSelectedRowContext = oEvent.getSource().getBindingContext('viewModel');

        // Get the row's data object using the binding context
        var oSelectedRowData = oSelectedRowContext.getObject();

        // Reset the values of the selected row's fields to their default state
        Object.assign(oSelectedRowData, {
          isDirty: false,
          isNew: true,
          asset: '',
          resource: '',
          resourceType: '',
          operator: '',
          autoAcceptance: true,
          acceptanceDelay: 1,
          correctionTime: 3000,
          lastModified: ''
        });

        // Update the model with the cleared data for the selected row
        var oModel = oSelectedRowContext.getModel();
        oModel.setProperty(oSelectedRowContext.getPath(), oSelectedRowData); // Update the model with new cleared values

        // Refresh the model to ensure the UI is updated
        oModel.refresh(true);
      },

      onDeleteResourceBtnPress: function(oEvent) {
        // Get the context of the selected row from the event
        var oSelectedRowContext = oEvent.getSource().getBindingContext('viewModel');

        // Ensure the context is valid
        if (!oSelectedRowContext) {
          console.warn('No row context found for deletion.');
          return;
        }

        var oSelectedRowData = oSelectedRowContext.getObject();
        var oModel = oSelectedRowContext.getModel();
        var aLineItems = oModel.getProperty('/lineItems');

        // Check if the row has existing assignments
        if (oSelectedRowData.resource || oSelectedRowData.operator) {
          MessageBox.error('Cannot delete a row with existing assignments. Please revoke the resource first.');
          return;
        }

        // Ensure at least one row per BOM component remains
        var sComponent = oSelectedRowData.component;
        var aComponentRows = aLineItems.filter(oRow => oRow.component === sComponent);

        if (aComponentRows.length <= 1) {
          sap.m.MessageToast.show('At least one row per BOM component must remain.');
          return;
        }

        // Remove the selected row from the line items
        // var iIndex = aLineItems.findIndex(oRow => oRow === oSelectedRowData);
        let aSameCompData = aLineItems.filter(oItem => {
          return oSelectedRowData.component === oItem.component;
        });

        var iIndex = aLineItems.findIndex(oRow => oRow.InSeatNumber === aSameCompData[aSameCompData.length - 1].InSeatNumber);
        if (iIndex !== -1) {
          aLineItems.splice(iIndex, 1);
        }

        // Update the model and refresh the bindings
        oModel.setProperty('/lineItems', aLineItems);
        oModel.updateBindings(true);
      },

      onPauseBtnPress: function(oEvent) {
        let oSource = oEvent.getSource();
        var oSelectedRowContext = oEvent.getSource().getBindingContext('viewModel');
        var sPath = oSelectedRowContext.getPath();
        let oViewModel = this.getView().getModel('viewModel');
        let btnType = oSource.getProperty('icon').split('-')[oSource.getProperty('icon').split('-').length - 1];

        if (btnType === 'pause') {
          oViewModel.setProperty(sPath + '/InActive', 0);
          oSource.setProperty('icon', 'sap-icon://media-play');
        } else {
          oViewModel.setProperty(sPath + '/InActive', 1);
          oSource.setProperty('icon', 'sap-icon://media-pause');
        }
      },

      onActiveStautsBtnPress: function(oEvent) {
        let oSource = oEvent.getSource();
        var oSelectedRowContext = oEvent.getSource().getBindingContext('viewModel');
        var sPath = oSelectedRowContext.getPath();
        let oViewModel = this.getView().getModel('viewModel');
        let btnStatus = oSource.getState();

        if (btnStatus) {
          oViewModel.setProperty(sPath + '/InActive', 1);
        } else {
          oViewModel.setProperty(sPath + '/InActive', 0);
        }
      },

      getGroupHeader: function(oGroup) {
        if (oGroup && oGroup.key) {
          return new sap.m.GroupHeaderListItem({
            title: 'BOM Relevant',
            upperCase: true
          });
        } else {
          return new sap.m.GroupHeaderListItem({
            title: 'Not BOM Relevant',
            upperCase: true
          });
        }
      },

      _resetModels: function() {
        var oViewModel = this.getView().getModel('viewModel'),
          oOrderDataModel = this.getView().getModel('orderData'),
          oRecipeModel = this.getView().getModel('recipeData'),
          oGrModel = this.getView().getModel('grModel');

        if (oOrderDataModel) oOrderDataModel.setData({});
        if (oViewModel) oViewModel.setData({...this.initialViewModelData});
        if (oRecipeModel) oRecipeModel.setData([]);
        if (oGrModel) oGrModel.setData([]);
      },

      _markItemAsDirty: function(oContext) {
        var oObject = oContext.getObject();
        oObject.isDirty = true;
        var oViewModel = this.getView().getModel('viewModel');
        oViewModel.setProperty('/isDirty', true);
      },

      _loadOrderData: function(sOrderId) {
        this._getOrderDetails(sOrderId).then(oOrderData => {
          this.selectedOrder = oOrderData;
          var aSFCs = oOrderData.sfcs.map(sSFC => {
            return {
              sfc: sSFC
            };
          });

          oOrderData.sfcs = aSFCs;
          this.selectedSFC = aSFCs[0].sfc;

          var oWorkCenters = oOrderData.workCenters.reduce((acc, val) => {
            acc[val.workCenter] = val;
            return acc;
          }, {});

          this._getWorkCenterData(Object.keys(oWorkCenters));
          this._getGRSummary();

          this.getView().getModel('orderData').setData(oOrderData);

          // Reset isDirty flag after loading the new order
          this.getView().getModel('viewModel').setProperty('/isDirty', false);
        });
      },

      _getOrderDetails: function(sOrderId) {
        var sUrl = this.getPublicApiRestDataSourceUri() + 'order/v1/orders';
        var oParameters = {
          plant: this.getPodController().getUserPlant(),
          order: sOrderId
        };

        return new Promise((resolve, reject) => {
          this.ajaxGetRequest(
            sUrl,
            oParameters,
            function(oData) {
              if (oData && oData.bom && oData.bom.bom) {
                resolve(oData);
              } else {
                reject('Order API response does not contain BOM data.');
              }
            },
            function(oError) {
              reject(oError);
            }
          );
        });
      },

      _getWorkCenterData: function(aWorkCenters) {
        var aPromises = aWorkCenters.map(oWorkCenter => {
          return new Promise((resolve, reject) => {
            var sUrl = this.getPublicApiRestDataSourceUri() + 'workcenter/v2/workcenters';
            var oParameters = {
              plant: this.getPodController().getUserPlant(),
              workCenter: oWorkCenter
            };
            this.ajaxGetRequest(sUrl, oParameters, resolve, reject);
          });
        });

        Promise.all(aPromises).then(aResponse => {
          aResponse.map(oResponse => {
            this.workCenters[oResponse[0].workCenter] = oResponse[0];
          });
        });
      },

      _getResourceData: function() {
        var sUrl = this.getPublicApiRestDataSourceUri() + '/resource/v2/resources';
        var oParamters = {
          plant: this.getPodController().getUserPlant()
        };
        return new Promise((resolve, reject) => this.ajaxGetRequest(sUrl, oParamters, resolve, reject));
      },

      _getOrderRoutingData: function(sRecipeId, sRecipeType = 'SHOP_ORDER') {
        var sUrl = this.getPublicApiRestDataSourceUri() + '/recipe/v1/recipes';
        var oParamters = {
          plant: this.getPodController().getUserPlant(),
          recipe: sRecipeId,
          recipeType: sRecipeType
        };
        return new Promise((resolve, reject) => this.ajaxGetRequest(sUrl, oParamters, resolve, reject));
      },

      _getAssignmentData: async function() {
        ErrorHandler.clearAllErrors();

        //Get resource information
        var oResourcePromise = this._getResourceData().then(aResourceList => {
          //Consider only resources of type PORTIONING or FORMULATION
          var aValidResources = aResourceList.filter(oResource =>
            oResource.types.find(oType => oType.type === 'PORTIONING' || oType.type === 'FORMULATION')
          );

          var aResources = this._createCustomDataObject(aValidResources);
          this.getView().getModel('resourceData').setData(aResources);

          if (aResources.length > 100) {
            this.getView().getModel('resourceData').setSizeLimit(aResources.length);
          }

          return aResources;
        });

        // var aExistingAssignments = await this._getAssignmentDataHANADB();
        //Get existing resource assignments
        var oExistingAsmtPromise = this._getAssignmentDataHANADB();

        //Get BOM details for order
        var oBomDataPromise = this._getBomData(this.selectedOrder.bom.bom, this.selectedOrder.bom.type).then(aBomData => {
          if (aBomData && aBomData.length === 0) {
            console.error('Could not load BOM information');
            return;
          }
          var oComponentsMap = aBomData[0].components.reduce((acc, val) => {
            acc[val.material.material] = val;
            return acc;
          }, {});

          this.oBomComponentsMap = oComponentsMap;
          return oComponentsMap;
        });

        var oRoutingDataPromise = this._getOrderRoutingData(this.selectedOrder.order);

        // this._getOrderRoutingData(this.selectedOrder.order)
        Promise.all([oResourcePromise, oExistingAsmtPromise, oBomDataPromise, oRoutingDataPromise])
          .then(
            function(aResponse) {
              var aResourceList = aResponse[0],
                aExistingAssignments = aResponse[1],
                aRecipeData = aResponse[3];
              return this._createTableLineItems(aRecipeData, aExistingAssignments);
            }.bind(this)
          )
          .then(
            function(aLineItems) {
              var oMaterials = aLineItems.reduce((acc, val) => {
                acc[val.component] = '';
                return acc;
              }, {});

              var aMaterials = Object.keys(oMaterials);
              var aPromises = aMaterials.map(oMaterial => this._getDetailsForMaterial(oMaterial));
              Promise.all(aPromises).then(this._handleMaterialDataFetch.bind(this));
            }.bind(this)
          )
          .then(function() {}.bind(this));
      },

      _getAssignmentDataHANADB: function() {
        var sUrl = 'https://dbapicall.cfapps.eu20-001.hana.ondemand.com/api/get/assignmentDetails';
        var orderData = this.getView().getModel('orderData').getData();
        // var oViewData = this.getView().getModel('viewModel').getData().lineItems1[0];
        var oPayload = {
          plant: orderData.plant,
          material: orderData.material.material
          // workcenter: oViewData.workCenter
        };

        return new Promise((resolve, reject) => this.ajaxPostRequest(sUrl, oPayload, resolve, reject));
      },

      _getSfcData: function() {
        var sUrl = this.getPublicApiRestDataSourceUri() + '/sfc/v1/sfcdetail';
        var oParamters = {
          plant: this.getPodController().getUserPlant(),
          sfc: this.selectedSFC
        };
        return new Promise((resolve, reject) => this.ajaxGetRequest(sUrl, oParamters, resolve, reject));
      },

      _getDetailsForMaterial: function(sMaterial) {
        var sUrl =
          this.getProductDataSourceUri() +
          "Materials?$select=ref,material,description,version&$filter=(material eq '" +
          encodeURIComponent(sMaterial) +
          "' and currentVersion eq true)";
        var oParameters = {};
        return new Promise((resolve, reject) => this.ajaxGetRequest(sUrl, oParameters, resolve, reject)).then(
          oResponse => oResponse.value[0]
        );
      },

      _getBomData: function(sBomId, sBomType = 'SHOP_ORDER') {
        var sUrl = this.getPublicApiRestDataSourceUri() + 'bom/v1/boms';
        var oParameters = {
          plant: this.getPodController().getUserPlant(),
          bom: sBomId,
          type: sBomType
        };
        return new Promise((resolve, reject) => this.ajaxGetRequest(sUrl, oParameters, resolve, reject));
      },

      //TODO: Promisify
      _getGRSummary: function() {
        var sUrl = this.getInventoryDataSourceUri() + 'order/goodsReceipt/summary';
        var oParameters = {
          sfc: this.selectedSFC,
          shopOrder: this.selectedOrder.order
        };
        this.ajaxGetRequest(
          sUrl,
          oParameters,
          function(oResponse) {
            var oData = {
              receivedQuantity: oResponse.receivedQuantity.value,
              targetQuantity: oResponse.targetQuantity.value,
              unitOfMeasure: oResponse.receivedQuantity.unitOfMeasure.uom,

              sfcReceivedQuantity: oResponse.lineItems[0].receivedQuantity.value,
              sfcTargetQuantity: oResponse.lineItems[0].targetQuantity.value,
              sfcUnitOfMeasure: oResponse.lineItems[0].receivedQuantity.unitOfMeasure.uom
            };

            this.getView().getModel('grModel').setData(oData);
          }.bind(this)
        );
      },

      _getManagedBatchData: function(oPayload) {
        var sUrl = this.PPD_BASE_URL + 'key=REG_eea6a337-72e0-4213-bab1-3e12d5127a79&async=false';
        return new Promise((resolve, reject) => this.ajaxPostRequest(sUrl, oPayload, resolve, reject));
      },

      _getResourceListForWorkCenter: function(aMembers) {
        var aResourceList = this.getView().getModel('resourceData').getProperty('/');

        return aResourceList.filter(oResource => {
          var isValidResource = oResource.types.find(oType => oType.type === 'PORTIONING' || oType.type === 'FORMULATION') ? true : false;
          if (!isValidResource) return false;

          var isWorkCenterMember = aMembers.find(oMember => oMember.resource.resource === oResource.resource);
          if (!isWorkCenterMember) return false;

          return true;
        });
      },

      _getResourceOccupancy: function(sResourceId) {
        var sUrl = this.PPD_BASE_URL + 'key=REG_f22f235e-1e89-4553-b952-7ac229b79065&async=false';
        var oPayload = {
          InPlant: this.getPodController().getUserPlant(),
          InResource: sResourceId
        };

        return new Promise((resolve, reject) => this.ajaxPostRequest(sUrl, oPayload, resolve, reject)).then(function(oResponse) {
          return oResponse.indicatorOutput.reduce((acc, val) => {
            acc[val.referenceName] = val.value;
            return acc;
          }, {});
        });
      },

      _getOperatorOccupancy: function(sOperatorId) {
        var sUrl = this.PPD_BASE_URL + 'key=REG_8f3da8b6-8b63-49a6-a45c-f13a029f7812&async=false';
        var oPayload = {
          InOperator: sOperatorId
        };

        return new Promise((resolve, reject) => this.ajaxPostRequest(sUrl, oPayload, resolve, reject));
      },

      _getResourceListForComponent: function(sOrderId, sSFC, sComponent) {
        var oResourceModel = this.getView().getModel('resourceData'),
          aResourceList = oResourceModel.getProperty('/');

        return aResourceList.filter(
          oResource =>
            oResource.customData.ORDER === sOrderId && oResource.customData.SFC === sSFC && oResource.customData.MATERIAL === sComponent
        );
      },

      _getDetailsForResource: function(sResourceId) {
        var oResourceModel = this.getView().getModel('resourceData'),
          aResourceList = oResourceModel.getProperty('/');
        return aResourceList.find(oResource => oResource.resource === sResourceId);
      },

      _createCustomDataObject: function(aData) {
        return aData.map(oItem => {
          var oCustomData = oItem.customValues.reduce((acc, val) => {
            acc[val.attribute] = val.value;
            return acc;
          }, {});

          oItem.customData = oCustomData;
          return oItem;
        });
      },

      _createTableLineItems: function(aData, aExistingAssignments) {
        var oConfiguration = this.getConfiguration(),
          InSeatNumber = 0;

        var aRecipeItems = aData.flatMap(recipe =>
          recipe.phases.flatMap(phase =>
            phase.recipePhaseComponentList.map(component => ({
              isDirty: false,
              isNew: true,
              workCenter: phase.workCenter,
              workCenterDesc: this.workCenters[phase.workCenter].description,
              phaseId: phase.phaseId,
              component: component.bomComponent.material.material,
              componentDesc: '',
              componentVersion: component.bomComponent.material.version,
              asset: '',
              resource: '',
              resourceType: '',
              operator: '',
              autoAcceptance: true,
              acceptanceDelay: oConfiguration && oConfiguration.defaultAcceptanceDelay ? oConfiguration.defaultAcceptanceDelay : 1,
              correctionTime: 3000,
              // correctionTime: oConfiguration && oConfiguration.defaultCorrectionTime ? oConfiguration.defaultCorrectionTime : 3000,
              lastModified: '',
              operationActivity: phase.recipeOperation.operationActivity.operationActivity,
              bom: component.bomComponent.bom.bom,
              bomVersion: component.bomComponent.bom.version,
              sequence: component.bomComponent.sequence,
              userAssignments: this.workCenters[phase.workCenter].userAssignments,
              resourceList: this._getResourceListForWorkCenter(this.workCenters[phase.workCenter].members),
              // InSeatNumber: (InSeatNumber = InSeatNumber + 100),
              InSeatNumber: 0,
              InActive: 0,
              WORK_CENTER: phase.workCenter,
              COMPONENT: component.bomComponent.material.material
            }))
          )
        );

        var aLineItems = this._mergeArrayByKeys(aRecipeItems, aExistingAssignments, ['WORK_CENTER', 'COMPONENT']);

        //If component does not have seat number, assign the highest sequence
        var iLastSequenceNo = aLineItems.reduce((acc, val) => {
          if (val.InSeatNumber > acc) acc = val.InSeatNumber;
          return acc;
        }, 0);

        aLineItems.filter(oItem => oItem.isBomRelevant).forEach(oItem => {
          if (oItem.InSeatNumber === 0) {
            var iNextSequence = Math.ceil(iLastSequenceNo / 100) * 100;
            oItem.InSeatNumber = iNextSequence;
            iLastSequenceNo = iNextSequence;
          }
        });

        this.getView().getModel('viewModel').setProperty('/lineItems1', aLineItems);

        return aLineItems;
      },

      _mergeArrayByKeys: function(aRecipeData, aExistingAssignments, aKeys) {
        var oRecipeMap = new Map();

        function getKey(obj) {
          return aKeys.map(key => obj[key]).join('|');
        }

        var aLineItems = [];
        aRecipeData.forEach(oRecipe => oRecipeMap.set(getKey(oRecipe), { ...oRecipe }));
        aExistingAssignments.forEach(oAssmt => {
          var sKey = getKey(oAssmt);
          var oLineItem;

          if (oRecipeMap.has(sKey)) {
            //Matched with existing assignment
            var oItem = oRecipeMap.get(sKey);
            var oBomComponent = this.oBomComponentsMap[oItem.component];
            oLineItem = {
              ...oItem,
              isNew: !oAssmt.RESOURCE,
              isBomRelevant: true,
              isUnitValid: oBomComponent && (oBomComponent.unitOfMeasure === 'KG' || oBomComponent.unitOfMeasure === 'G'),
              resource: oAssmt.RESOURCE,
              autoAcceptance: true,
              acceptanceDelay: oAssmt.ACCEPTANCE_DELAY,
              operator: oAssmt.OPERATOR,
              correctionTime: oAssmt.CORRECTION_TIME,
              assignmentUpdatedAt: oAssmt.UPDATED_DATE_TIME,
              lastModified: oAssmt.UPDATED_DATE_TIME,
              InSeatNumber: oAssmt.SEAT_NUMBER,
              InActive: oAssmt.ACTIVE,
              resourceType: '',
              resourceLastModifiedAt: '',
              asset: ''
            };
          } else {
            //Not matched scenario
            oLineItem = {
              isNew: false,
              isDirty: false,
              isUnitValid: false,
              isBomRelevant: false,
              resource: oAssmt.RESOURCE,
              autoAcceptance: true,
              acceptanceDelay: oAssmt.ACCEPTANCE_DELAY,
              operator: oAssmt.OPERATOR,
              correctionTime: oAssmt.CORRECTION_TIME,
              assignmentUpdatedAt: oAssmt.UPDATED_DATE_TIME,
              lastModified: oAssmt.UPDATED_DATE_TIME,
              InSeatNumber: oAssmt.SEAT_NUMBER,
              InActive: oAssmt.ACTIVE,
              resourceType: '',
              resourceLastModifiedAt: '',
              asset: '',

              component: oAssmt.COMPONENT,
              componentDesc: '',
              workCenter: oAssmt.WORK_CENTER,
              workCenterDesc: '',
              phaseId: ''
            };
          }
          var oResource = this._getDetailsForResource(oAssmt.RESOURCE);
          if (oResource) {
            oLineItem.resourceType = oResource.types;
            oLineItem.resourceLastModifiedAt = moment(oResource.modifiedDateTime).toDate();

            if (oResource.asset) {
              oLineItem.asset = oResource.asset.name;
            }
          }
          aLineItems.push(oLineItem);
        });

        return aLineItems;
      },

      _handleMaterialDataFetch: async function(aMaterials) {
        //Create a map from the service response for material details
        this.materialsList = aMaterials.reduce((acc, val) => {
          if (!val) return acc;
          acc[val.material] = val;
          return acc;
        }, {});

        var aLineItems = this.getView().getModel('viewModel').getProperty('/lineItems1');

        for (var oItem of aLineItems) {
          var oMaterialDetail = this.materialsList[oItem.component];
          oItem.componentDesc = oMaterialDetail ? oMaterialDetail.description : '';
          // oItem.isBatchManaged = true;
        }
        this.getView().getModel('viewModel').setProperty('/lineItems', aLineItems);

        //TODO: Move below out of this function
        //Fire resource validations
        let aTableItems = this.getView().byId('idMassOpAsmtTable').getItems().filter(oItem => oItem instanceof sap.m.ColumnListItem);
        for (var i in aTableItems) {
          let oSelect = aTableItems[i].getAggregation('cells')[4];
          if (oSelect.getSelectedKey()) oSelect.fireChange({ selectedItem: oSelect.getSelectedItem() });
        }
      },

      _assignResource: function(oItem) {
        var sUrl = this.PPD_BASE_URL + 'key=REG_e64981d3-2a78-4751-8e86-f796485f1db5&async=false';

        var oPayload = {
          InOrderStatus: this.selectedOrder.executionStatus,
          InHeaderMaterialDesc: this.selectedOrder.material.description,
          InHeaderMaterial: this.selectedOrder.material.material,
          InPlant: this.getPodController().getUserPlant(),
          InResource: oItem.resource,
          InMaterial: oItem.component,
          InWorkCenter: oItem.workCenter,
          InOperator: oItem.operator,
          InAutAcceptance: oItem.autoAcceptance,
          InAutoTimeDelay: oItem.acceptanceDelay,
          // InSubWeighing: oItem.resourceType.find(oType => oType.type === 'PORTIONING') ? true : false,
          InSubWeighing: true, //Only portioning resources allowed
          InSFC: this.selectedSFC,
          InOrderBO: this.selectedOrder.order,
          InOperationActivity: oItem.operationActivity,
          InUOM: 'KG', //TODO: Capture from bom component
          InERPSequence: oItem.sequence,
          InBOM: this.selectedOrder.bom.bom,
          InMaterialVersion: oItem.componentVersion,
          InBOMVersion: this.selectedOrder.bom.version,
          InCorrectionTime: oItem.correctionTime,
          InSeatNumber: oItem.InSeatNumber
        };

        return new Promise((resolve, reject) => this.ajaxPostRequest(sUrl, oPayload, resolve, reject));
      },

      _revokeResource: function(sResourceId) {
        var sUrl = this.PPD_BASE_URL + 'key=REG_c245216f-4e25-4b85-8593-ed44db51a531&async=false';
        var oPayload = {
          InPlant: this.getPodController().getUserPlant(),
          InResource: sResourceId
        };
        return new Promise((resolve, reject) => this.ajaxPostRequest(sUrl, oPayload, resolve, reject));
      },

      _saveResourceAssignments: function(aItems) {
        var aPromises = [];

        for (var i = 0; i < aItems.length; i++) {
          var oItem = aItems[i];
          aPromises.push(this._assignResource(oItem));
        }

        Promise.allSettled(aPromises).then(
          function() {
            // Clearing Table selections
            this.getView().byId('idMassOpAsmtTable').removeSelections();
            this._getAssignmentData(this.selectedOrder.order);
            this.getView().getModel('viewModel').setProperty('/isDirty', false);
          }.bind(this)
        );
      },

      _setLineItemResourceData: function(oModel, sPath, oResourceData, bNew) {
        var oData = oModel.getProperty(sPath);

        oData = {
          ...oData,
          resource: oResourceData.resource || '',
          resourceType: oResourceData.types || '',
          lastModified: oResourceData.modifiedDateTime ? moment(oResourceData.modifiedDateTime).toDate() : '',
          resourceLastModifiedAt: oResourceData.modifiedDateTime ? moment(oResourceData.modifiedDateTime).toDate() : '',
          asset: oResourceData.asset ? oResourceData.asset.name : ''
        };

        //TODO: Get defaults from config
        if (bNew) {
          oData.isNew = true;
          oData.isDirty= false;
          oData.operator = '';
          oData.autoAcceptance = true;
          oData.acceptanceDelay = 1;
          oData.correctionTime = 3000;
        }

        oModel.setProperty(sPath, oData);
      },

      //TODO: Move below to formatter
      autoAcceptanceFormatter: function(bIsAutoAcceptance) {
        if (bIsAutoAcceptance) return 'auto';
        return 'manual';
      },

      dateTimeFormatter: function(oDate) {
        if (!oDate) return;
        return moment(oDate).format('MMM DD, YYYY HH:mm:ss');
      },

      formatRowEditable: function(bIsNew, bIsUnitValid, bIsBomRelevant) {
        return bIsNew && bIsUnitValid && bIsBomRelevant;
      },

      formatAddEnabled: function(bIsUnitValid, bIsBomRelevant) {
        return bIsUnitValid && bIsBomRelevant;
      },

      formatRowEditable1: function(bIsUnitValid) {
        return bIsUnitValid;
      },

      formatActiveBtn: function(iValue) {
        if (iValue) return 'sap-icon://media-pause';
        else return 'sap-icon://media-play';
      },

      getPercentValue: function(plannedQty, completedQty) {
        let percentValue = parseFloat(completedQty) / parseFloat(plannedQty) * 100;
        return Math.floor(percentValue);
      }
    });
    return oPluginViewController;
  }
);
