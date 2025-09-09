sap.ui.define(
  [
    'sap/ui/model/json/JSONModel',
    'sap/ui/core/Fragment',
    'sap/m/MessageBox',
    'sap/ui/model/Sorter',
    'sap/ui/model/Filter',
    'sap/ui/model/FilterOperator'
  ],
  function (JSONModel, Fragment, MessageBox, Sorter, Filter, FilterOperator) {
    'use strict';
    return {
      pDialog: null,
      oController: null,
      batchModel: null,

      /* *** Event Handlers *** */
      onCloseVHDia: function (oEvent) {
        this.closeValueHelpDialog();
      },

      handleHUScan: async function (oEvent) {
        var oHuInput = oEvent.getSource(),
          sValue = oEvent.getParameter('value'),
          oScannedValue;

        this.scannedHU = null;
        this.scannedHuItem = null;

        try {
          oScannedValue = JSON.parse(sValue);
        } catch (e) {}

        if (!oScannedValue) {
          oHuInput.setValue('');
          oHuInput.setValueState('Error');
          return;
        }

        var sMaterial = this.batchModel.getProperty('/componentInfo/component');
        var oHuItem = await this._getConsumptionItemFromHu(oScannedValue.handlingUnit, sMaterial);

        if (!oHuItem) {
          MessageBox.error('Hu items are not relevant for current SFC');
          oHuInput.setValue('');
          oHuInput.setValueState('Error');
          return;
        }

        this.scannedHU = oScannedValue;
        this.scannedHuItem = oHuItem;

        oHuInput.setValue(oHuItem.huno);

        this._setBatchNumber(oHuItem.batch);
        this.closeValueHelpDialog();
      },

      handleArticleScan: function (oEvent) {
        var oArticleInput = oEvent.getSource(),
          sValue = oEvent.getParameter('value'),
          oScannedValue;

        try {
          oScannedValue = JSON.parse(sValue);
        } catch (e) {}

        if (!oScannedValue) {
          oArticleInput.setValue('');
          oArticleInput.setValueState('Error');
          return;
        }

        var sMaterial = this.batchModel.getProperty('/componentInfo/component');
        if (sMaterial !== oScannedValue.Material) {
          oArticleInput.setValue('');
          oArticleInput.setValueState('Error');
          oArticleInput.setValueStateText('Scanned article does not match selected BOM component');
          return;
        } else {
          oArticleInput.setValueState('None');
        }

        this._setBatchNumber(oScannedValue.StockID);
        this.closeValueHelpDialog();
      },

      onBatchListItemPress: function (oEvent) {
        var oListItem = oEvent.getSource(),
          oData = oListItem.getBindingContext().getObject();
        this._setBatchNumber(oData.batchNumber);
        this.closeValueHelpDialog();
      },

      /* *** Accessors and Mutators *** */
      getParentController: function () {
        return this.oController;
      },

      setParentController: function (oController) {
        this.oController = oController;
      },

      getValueHelpDialog: function () {
        if (this.pDialog) return this.pDialog;

        return Fragment.load({
          id: this.getParentController().getView().getId(),
          name: 'arun.ext.podplugins.massOperatorAssignmentPluginV2.view.fragments.BatchValueHelpDialog',
          controller: this
        }).then((oDialog) => {
          oDialog.setModel(this.batchModel);
          return oDialog;
        });
      },

      showValueHelpDialog: async function () {
        if (!this.pDialog) {
          this.pDialog = await this.getValueHelpDialog();
        }

        this._getBatchListForComponent().then((oResponse) => {
          // this.batchModel.setProperty('/batchList', oResponse.content);
          var aData = oResponse;
          aData.forEach((oItem) => {
            var mCharcValues = oItem.batchCharcValues?.reduce((acc, val) => {
              acc[val.charcName] = val;
              return acc;
            }, {});

            if (!mCharcValues) {
              oItem.bestBeforeDate = null;
              oItem.qaStatus = null;
              return;
            }

            var oBestBefore = mCharcValues['LOBM_VFDAT'];
            if (oBestBefore) {
              oItem.bestBeforeDate = oBestBefore.charcValue;
            }

            var oQaStatus = mCharcValues['ZQASTAT'];
            if (oQaStatus) {
              oItem.qaStatus = oQaStatus.charcValue;
            }
          });

          var sDefaultSloc = this.batchModel.getProperty('/componentInfo/defaultStorageLoc');
          var aFilteredData = aData.filter(
            (oItem) => oItem.storageLocation.storageLocation === sDefaultSloc && oItem.qaStatus !== 'Q'
          );

          this.batchModel.setProperty('/batchList', aFilteredData);
          this.batchModel.refresh(true);

          var oTable = this.getParentController().getView().byId('idBatchVHD-batchList');
          oTable
            .getBinding('items')
            .sort([new Sorter('batch/shelfLifeExpirationDate', false), new Sorter('remainingQuantity', true)]);
        });

        this.pDialog.open();
      },

      closeValueHelpDialog: function () {
        if (!this.pDialog) return;
        this.pDialog.close();

        var that = this.getParentController(),
          oHuScanInput = that.byId('idHuScanInput'),
          oArticleScanInput = that.byId('idArticleScanInput');

        oHuScanInput.setValue('');
        oHuScanInput.setValueState('None');

        oArticleScanInput.setValue('');
        oArticleScanInput.setValueState('None');
      },

      setSelectedComponentInfo: function (oContext) {
        if (!this.batchModel) {
          this.batchModel = new JSONModel({});
        }

        this.batchModel.setProperty('/componentInfo', oContext.getObject());
        this.batchModel.setProperty('/componentPath', oContext.getPath());
      },

      dateFormatter: function (sDate) {
        if (!sDate) return '';

        return moment(sDate).format('YYYY-MM-DD');
      },

      /* *** Helper Functions *** */
      _getBatchListForComponent: function () {
        // var that = this.getParentController();
        // var sUrl = that.getPublicApiRestDataSourceUri() + '/inventory/v1/batches';
        // var sMaterial = this.batchModel.getProperty('/componentInfo/component');
        // var oParams = {
        //   plant: that.getPodController().getUserPlant(),
        //   material: sMaterial,
        //   includeCharacteristics: true
        // };

        // return new Promise((resolve, reject) => that.ajaxGetRequest(sUrl, oParams, resolve, reject));

        var that = this.getParentController();
        var sUrl = that.getInventoryDataSourceUri() + 'inventory/findInventory';
        var sMaterialRef = this.batchModel.getProperty('/componentInfo/materialRef');
        var oSelectedOrder = that.getPodSelectionModel().selectedOrderData;
        var oParams = {
          materialRef: sMaterialRef,
          shopOrderRef: oSelectedOrder.orderRef,
          emptyBatchNumberIgnored: true
        };

        return new Promise((resolve, reject) => that.ajaxGetRequest(sUrl, oParams, resolve, reject));
      },

      _getHandlingUnitDataFromS4: function (sHuNo) {
        //CPP_GetPackingDataFromS4
        var that = this.getParentController(),
          sUrl =
            that.getPublicApiRestDataSourceUri() +
            '/pe/api/v1/process/processDefinitions/start?key=REG_57bd9fbd-5f78-4ac0-ba6b-7577d0bf7a57&async=false';
        var oPayload = {
          items: [{ huno: sHuNo }]
        };
        return new Promise((resolve, reject) => that.ajaxPostRequest(sUrl, oPayload, resolve, reject));
      },

      _getConsumptionItemFromHu: async function (sHandlingUnit, sMaterial) {
        var aHuItems = await this._getHandlingUnitDataFromS4(sHandlingUnit).then((oResponse) => {
          if (!oResponse || !oResponse.content || oResponse.content.length === 0) {
            return null;
          }

          var aItems = oResponse.content;
          if (sMaterial) {
            aItems = oResponse.content.filter((oItem) => oItem.material === sMaterial);
          }
          return aItems;
        });

        if (!aHuItems || aHuItems.length === 0) {
          return null;
        }

        // var oLineItemMaterial = this.getCurrentModel().getData().material;
        var oItem = aHuItems.find((oHuItem) => oHuItem.material === sMaterial);

        //If HU is open, check if there is openQuantity for that material
        if (oItem && oItem.openindicator === 'X' && oItem.openQuantity <= 0) return null;

        //If the HU is not open, check if packedQty is not zero
        if (oItem && oItem.openIndicator === '' && oItem.packedQty <= 0) return null;

        return oItem;
      },

      _setBatchNumber: function (sBatchNo) {
        var that = this.getParentController(),
          sPath = this.batchModel.getProperty('/componentPath');

        var oBatchValidationResult = this._validateBatchSelection(sBatchNo);
        if (oBatchValidationResult.isBatchValid) {
          that.updateBatchForComponent(sPath, sBatchNo);
        } else {
          MessageBox.error(oBatchValidationResult.message);
        }
      },

      _validateBatchSelection: function (sBatchNo) {
        var that = this.getParentController(),
          sDefaultSloc = this.batchModel.getProperty('/componentInfo/defaultStorageLoc'),
          sMaterial = this.batchModel.getProperty('/componentInfo/component'),
          fConsumptionQty = this.batchModel.getProperty('/componentInfo/quantity'),
          sMessage = '';

        //TODO: Component is not batch managed
        var aBatches = this.batchModel.getProperty('/batchList');
        var oSelectedBatch = aBatches.find((oBatch) => oBatch.batchNumber === sBatchNo);

        if (!oSelectedBatch) {
          return {
            isBatchValid: false,
            message: 'Batch number is not valid'
          };
        }

        if (!oSelectedBatch.batch.shelfLifeExpirationDate) {
          return {
            isBatchValid: false,
            message: 'Batch does not have expiry date'
          };
        }

        //Check component default storage location
        if (sDefaultSloc && oSelectedBatch.storageLocation.storageLocation !== sDefaultSloc) {
          sMessage = this.getParentController().getI18nText('batchNotInDefaultSlocErrMsg', [sBatchNo, sDefaultSloc]);
          return {
            isBatchValid: false,
            message: sMessage
          };
        }

        if (fConsumptionQty > oSelectedBatch.remainingQuantity) {
          sMessage = this.getParentController().getI18nText('batchDoesNotContainRequiredStockErrMsg', [
            oSelectedBatch.batchNumber,
            fConsumptionQty
          ]);
          return {
            isBatchValid: false,
            message: sMessage
          };
        }

        //Check if the selected batch has lowest expiry in the batch list
        var aFilteredBatches = aBatches.filter(
          (oBatch) => !!oBatch.batch.shelfLifeExpirationDate && oBatch.storageLocation.storageLocation === sDefaultSloc
        );
        var aDates = aFilteredBatches.map((oBatch) => new Date(oBatch.batch.shelfLifeExpirationDate));
        var oLowestExpDate = new Date(Math.min(...aDates));
        var oLowestExpBatch = aFilteredBatches.find((oBatch) =>
          moment(oBatch.batch.shelfLifeExpirationDate).isSame(oLowestExpDate)
        );

        if (!moment(oLowestExpDate).isSame(oSelectedBatch.batch.shelfLifeExpirationDate)) {
          sMessage = this.getParentController().getI18nText('errorLowerBatchExpiry', [
            sMaterial,
            oLowestExpBatch.batchNumber
          ]);
          return {
            isBatchValid: false,
            message: sMessage
          };
        }

        return {
          isBatchValid: true,
          message: ''
        };
      }
    };
  }
);
