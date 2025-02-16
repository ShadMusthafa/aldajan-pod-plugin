sap.ui.define([
  'jquery.sap.global',
  "sap/dm/dme/podfoundation/controller/PluginViewController",
  "sap/ui/model/json/JSONModel",
  'sap/m/MessageToast',
  'sap/viz/ui5/data/FlattenedDataset',
  'sap/viz/ui5/controls/common/feeds/FeedItem',
  'sap/viz/ui5/format/ChartFormatter',
  'sap/ui/model/Filter',
  'sap/ui/model/FilterOperator'
], function (jQuery, PluginViewController, JSONModel, MessageToast,
  FlattenedDataset,
  FeedItem,
  ChartFormatter,
  Filter,
  FilterOperator) {
  "use strict";

  return PluginViewController.extend("arun.ext.podplugins.chartrealPlugin.controller.MainView", {
    onInit: function () {
      // Call the base controller's onInit
      PluginViewController.prototype.onInit.apply(this, arguments);

      // Initialize an empty model and set it to the view
      var oModel = new JSONModel({
        "data": [
          {
            "FixedLimit": "1000000",
            "FixedLimit2": "3000000",
            "FixedLimit3": "4000000",
            "UPPER_TOLERANCE": 2000000,
            "LOWER_TOLERANCE": 0,
            "Date": "5/16/2013",
            "Revenue": 4114672.47,
            "Cost": 1651069.9
          },
          {
            "FixedLimit": "1000000",
            "FixedLimit2": "3000000",
            "FixedLimit3": "4000000",
            "UPPER_TOLERANCE": 2000000,
            "LOWER_TOLERANCE": 0,
            "Date": "5/17/2013",
            "Revenue": 4102263.56,
            "Cost": 1612699.35
          },
          {
            "FixedLimit": "1000000",
            "FixedLimit2": "3000000",
            "FixedLimit3": "4000000",
            "UPPER_TOLERANCE": 2000000,
            "LOWER_TOLERANCE": 0,
            "Date": "5/18/2013",
            "Revenue": 4045931.36,
            "Cost": 1634043.2
          },
          {
            "FixedLimit": "1000000",
            "FixedLimit2": "3000000",
            "FixedLimit3": "4000000",
            "UPPER_TOLERANCE": 2000000,
            "LOWER_TOLERANCE": 0,
            "Date": "5/19/2013",
            "Revenue": 4047479.25,
            "Cost": 1641802.05
          },
          {
            "FixedLimit": "1000000",
            "FixedLimit2": "3000000",
            "FixedLimit3": "4000000",
            "UPPER_TOLERANCE": 2000000,
            "LOWER_TOLERANCE": 0,
            "Date": "5/20/2013",
            "Revenue": 3969401.16,
            "Cost": 1670427.78
          },
          {
            "FixedLimit": "1000000",
            "FixedLimit2": "3000000",
            "FixedLimit3": "4000000",
            "UPPER_TOLERANCE": 2000000,
            "LOWER_TOLERANCE": 0,
            "Date": "5/21/2013",
            "Revenue": 3963544.2,
            "Cost": 1632849.44
          },
          {
            "FixedLimit": "1000000",
            "FixedLimit2": "3000000",
            "FixedLimit3": "4000000",
            "UPPER_TOLERANCE": 2000000,
            "LOWER_TOLERANCE": 0,
            "Date": "5/22/2013",
            "Revenue": 3936925.15,
            "Cost": 1612415.82
          },
          {
            "FixedLimit": "1000000",
            "FixedLimit2": "3000000",
            "FixedLimit3": "4000000",
            "UPPER_TOLERANCE": 2000000,
            "LOWER_TOLERANCE": 0,
            "Date": "5/23/2013",
            "Revenue": 3846673.51,
            "Cost": 1605320.87
          },
          {
            "FixedLimit": "1000000",
            "FixedLimit2": "3000000",
            "FixedLimit3": "4000000",
            "UPPER_TOLERANCE": 2000000,
            "LOWER_TOLERANCE": 0,
            "Date": "5/24/2013",
            "Revenue": 3918483.35,
            "Cost": 1599169.52
          },
          {
            "FixedLimit": "1000000",
            "FixedLimit2": "3000000",
            "FixedLimit3": "4000000",
            "UPPER_TOLERANCE": 2000000,
            "LOWER_TOLERANCE": 0,
            "Date": "5/25/2013",
            "Revenue": 3906454.86,
            "Cost": 1569188.34
          },
          {
            "FixedLimit": "1000000",
            "FixedLimit2": "3000000",
            "FixedLimit3": "4000000",
            "UPPER_TOLERANCE": 2000000,
            "LOWER_TOLERANCE": 0,
            "Date": "5/26/2013",
            "Revenue": 3843918.94,
            "Cost": 1602834.06
          },
          {
            "FixedLimit": "1000000",
            "FixedLimit2": "3000000",
            "FixedLimit3": "4000000",
            "UPPER_TOLERANCE": 2000000,
            "LOWER_TOLERANCE": 0,
            "Date": "5/27/2013",
            "Revenue": 3800927.24,
            "Cost": 1648604.67
          },
          {
            "FixedLimit": "1000000",
            "FixedLimit2": "3000000",
            "FixedLimit3": "4000000",
            "UPPER_TOLERANCE": 2000000,
            "LOWER_TOLERANCE": 0,
            "Date": "5/28/2013",
            "Revenue": 3839956.23,
            "Cost": 1635140.35
          },
          {
            "FixedLimit": "1000000",
            "FixedLimit2": "3000000",
            "FixedLimit3": "4000000",
            "UPPER_TOLERANCE": 2000000,
            "LOWER_TOLERANCE": 0,
            "Date": "5/29/2013",
            "Revenue": 3874721.9,
            "Cost": 1608242.5
          },
          {
            "FixedLimit": "1000000",
            "FixedLimit2": "3000000",
            "FixedLimit3": "4000000",
            "UPPER_TOLERANCE": 2000000,
            "LOWER_TOLERANCE": 0,
            "Date": "5/30/2013",
            "Revenue": 3892956.92,
            "Cost": 1661427.09
          },
          {
            "FixedLimit": "1000000",
            "FixedLimit2": "3000000",
            "FixedLimit3": "4000000",
            "UPPER_TOLERANCE": 2000000,
            "LOWER_TOLERANCE": 0,
            "Date": "5/31/2013",
            "Revenue": 3883927.82,
            "Cost": 1610235.98
          },
          {
            "FixedLimit": "1000000",
            "FixedLimit2": "3000000",
            "FixedLimit3": "4000000",
            "UPPER_TOLERANCE": 2000000,
            "LOWER_TOLERANCE": 0,
            "Date": "6/1/2013",
            "Revenue": 3840835.51,
            "Cost": 1619765.63
          },
          {
            "FixedLimit": "1000000",
            "FixedLimit2": "3000000",
            "FixedLimit3": "4000000",
            "UPPER_TOLERANCE": 2000000,
            "LOWER_TOLERANCE": 0,
            "Date": "6/2/2013",
            "Revenue": 3803715.03,
            "Cost": 1621362.93
          },
          {
            "FixedLimit": "1000000",
            "FixedLimit2": "3000000",
            "FixedLimit3": "4000000",
            "UPPER_TOLERANCE": 2000000,
            "LOWER_TOLERANCE": 0,
            "Date": "6/3/2013",
            "Revenue": 3807732.69,
            "Cost": 1656153.12
          },
          {
            "FixedLimit": "1000000",
            "FixedLimit2": "3000000",
            "FixedLimit3": "4000000",
            "UPPER_TOLERANCE": 2000000,
            "LOWER_TOLERANCE": 0,
            "Date": "6/4/2013",
            "Revenue": 3800870.4,
            "Cost": 1607146.15
          },
          {
            "FixedLimit": "1000000",
            "FixedLimit2": "3000000",
            "FixedLimit3": "4000000",
            "UPPER_TOLERANCE": 2000000,
            "LOWER_TOLERANCE": 0,
            "Date": "6/5/2013",
            "Revenue": 3751635.84,
            "Cost": 1618429.91
          },
          {
            "FixedLimit": "1000000",
            "FixedLimit2": "3000000",
            "FixedLimit3": "4000000",
            "UPPER_TOLERANCE": 2000000,
            "LOWER_TOLERANCE": 0,
            "Date": "6/6/2013",
            "Revenue": 3730524.12,
            "Cost": 1625863.14
          },
          {
            "FixedLimit": "1000000",
            "FixedLimit2": "3000000",
            "FixedLimit3": "4000000",
            "UPPER_TOLERANCE": 2000000,
            "LOWER_TOLERANCE": 0,
            "Date": "6/7/2013",
            "Revenue": 3700685.31,
            "Cost": 1624820.63
          },
          {
            "FixedLimit": "1000000",
            "FixedLimit2": "3000000",
            "FixedLimit3": "4000000",
            "UPPER_TOLERANCE": 2000000,
            "LOWER_TOLERANCE": 0,
            "Date": "6/8/2013",
            "Revenue": 3675058.1,
            "Cost": 1577386.63
          },
          {
            "FixedLimit": "1000000",
            "FixedLimit2": "3000000",
            "FixedLimit3": "4000000",
            "UPPER_TOLERANCE": 2000000,
            "LOWER_TOLERANCE": 0,
            "Date": "6/9/2013",
            "Revenue": 3678103.35,
            "Cost": 1552635.47
          },
          {
            "FixedLimit": "1000000",
            "FixedLimit2": "3000000",
            "FixedLimit3": "4000000",
            "UPPER_TOLERANCE": 2000000,
            "LOWER_TOLERANCE": 0,
            "Date": "6/10/2013",
            "Revenue": 3699091.17,
            "Cost": 1525174.12
          },
          {
            "FixedLimit": "1000000",
            "FixedLimit2": "3000000",
            "FixedLimit3": "4000000",
            "UPPER_TOLERANCE": 2000000,
            "LOWER_TOLERANCE": 0,
            "Date": "6/11/2013",
            "Revenue": 3538825.56,
            "Cost": 1525701.53
          },
          {
            "FixedLimit": "1000000",
            "FixedLimit2": "3000000",
            "FixedLimit3": "4000000",
            "UPPER_TOLERANCE": 2000000,
            "LOWER_TOLERANCE": 0,
            "Date": "6/12/2013",
            "Revenue": 3553949.33,
            "Cost": 1596956.82
          },
          {
            "FixedLimit": "1000000",
            "FixedLimit2": "3000000",
            "FixedLimit3": "4000000",
            "UPPER_TOLERANCE": 2000000,
            "LOWER_TOLERANCE": 0,
            "Date": "6/13/2013",
            "Revenue": 3606987.64,
            "Cost": 1647852.91
          },
          {
            "FixedLimit": "1000000",
            "FixedLimit2": "3000000",
            "FixedLimit3": "4000000",
            "UPPER_TOLERANCE": 2000000,
            "LOWER_TOLERANCE": 0,
            "Date": "6/14/2013",
            "Revenue": 3625783.31,
            "Cost": 1717306.54
          },
          {
            "FixedLimit": "1000000",
            "FixedLimit2": "3000000",
            "FixedLimit3": "4000000",
            "UPPER_TOLERANCE": 2000000,
            "LOWER_TOLERANCE": 0,
            "Date": "6/15/2013",
            "Revenue": 3639028.77,
            "Cost": 1736622.62
          },
          {
            "FixedLimit": "1000000",
            "FixedLimit2": "3000000",
            "FixedLimit3": "4000000",
            "UPPER_TOLERANCE": 2000000,
            "LOWER_TOLERANCE": 0,
            "Date": "6/16/2013",
            "Revenue": 3659304.17,
            "Cost": 1778705
          },
          {
            "FixedLimit": "1000000",
            "FixedLimit2": "3000000",
            "FixedLimit3": "4000000",
            "UPPER_TOLERANCE": 2000000,
            "LOWER_TOLERANCE": 0,
            "Date": "6/17/2013",
            "Revenue": 3698389.75,
            "Cost": 1799278.57
          },
          {
            "FixedLimit": "1000000",
            "FixedLimit2": "3000000",
            "FixedLimit3": "4000000",
            "UPPER_TOLERANCE": 2000000,
            "LOWER_TOLERANCE": 0,
            "Date": "6/18/2013",
            "Revenue": 3783396.39,
            "Cost": 1877925.83
          },
          {
            "FixedLimit": "1000000",
            "FixedLimit2": "3000000",
            "FixedLimit3": "4000000",
            "UPPER_TOLERANCE": 2000000,
            "LOWER_TOLERANCE": 0,
            "Date": "6/19/2013",
            "Revenue": 3722990.45,
            "Cost": 1891284.75
          },
          {
            "FixedLimit": "1000000",
            "FixedLimit2": "3000000",
            "FixedLimit3": "4000000",
            "UPPER_TOLERANCE": 2000000,
            "LOWER_TOLERANCE": 0,
            "Date": "6/20/2013",
            "Revenue": 3617619.97,
            "Cost": 1836461.76
          },
          {
            "FixedLimit": "1000000",
            "FixedLimit2": "3000000",
            "FixedLimit3": "4000000",
            "UPPER_TOLERANCE": 2000000,
            "LOWER_TOLERANCE": 0,
            "Date": "6/21/2013",
            "Revenue": 3675695.82,
            "Cost": 1860459.15
          },
          {
            "FixedLimit": "1000000",
            "FixedLimit2": "3000000",
            "FixedLimit3": "4000000",
            "UPPER_TOLERANCE": 2000000,
            "LOWER_TOLERANCE": 0,
            "Date": "6/22/2013",
            "Revenue": 3787026.87,
            "Cost": 1881472.38
          },
          {
            "FixedLimit": "1000000",
            "FixedLimit2": "3000000",
            "FixedLimit3": "4000000",
            "UPPER_TOLERANCE": 2000000,
            "LOWER_TOLERANCE": 0,
            "Date": "6/23/2013",
            "Revenue": 3780119.17,
            "Cost": 1870202.8
          },
          {
            "FixedLimit": "1000000",
            "FixedLimit2": "3000000",
            "FixedLimit3": "4000000",
            "UPPER_TOLERANCE": 2000000,
            "LOWER_TOLERANCE": 0,
            "Date": "6/24/2013",
            "Revenue": 3765919.53,
            "Cost": 1882223.7
          },
          {
            "FixedLimit": "1000000",
            "FixedLimit2": "3000000",
            "FixedLimit3": "4000000",
            "UPPER_TOLERANCE": 2000000,
            "LOWER_TOLERANCE": 0,
            "Date": "6/25/2013",
            "Revenue": 3705075.73,
            "Cost": 1821588.65
          },
          {
            "FixedLimit": "1000000",
            "FixedLimit2": "3000000",
            "FixedLimit3": "4000000",
            "UPPER_TOLERANCE": 2000000,
            "LOWER_TOLERANCE": 0,
            "Date": "6/26/2013",
            "Revenue": 3737867.28,
            "Cost": 1844228.2
          },
          {
            "FixedLimit": "1000000",
            "FixedLimit2": "3000000",
            "FixedLimit3": "4000000",
            "UPPER_TOLERANCE": 2000000,
            "LOWER_TOLERANCE": 0,
            "Date": "6/27/2013",
            "Revenue": 3764829.25,
            "Cost": 1806763.43
          },
          {
            "FixedLimit": "1000000",
            "FixedLimit2": "3000000",
            "FixedLimit3": "4000000",
            "UPPER_TOLERANCE": 2000000,
            "LOWER_TOLERANCE": 0,
            "Date": "6/28/2013",
            "Revenue": 3803953.75,
            "Cost": 1827483.04
          },
          {
            "FixedLimit": "1000000",
            "FixedLimit2": "3000000",
            "FixedLimit3": "4000000",
            "UPPER_TOLERANCE": 2000000,
            "LOWER_TOLERANCE": 0,
            "Date": "6/29/2013",
            "Revenue": 3749147.69,
            "Cost": 1729439.23
          },
          {
            "FixedLimit": "1000000",
            "FixedLimit2": "3000000",
            "FixedLimit3": "4000000",
            "UPPER_TOLERANCE": 2000000,
            "LOWER_TOLERANCE": 0,
            "Date": "6/30/2013",
            "Revenue": 3784917.64,
            "Cost": 1759307.38
          }
        ]
      });
      this.getView().setModel(oModel, 'data');

      // Initialize the chart and fetch data
      this._initCombineChart('timeseries_combination');
      // this._initChart();
      // this._fetchConsumptionData();

      //Set up auto-refresh every 1 minute
      // this._startAutoRefresh();

    },
    _startAutoRefresh: function () {
      // Store the interval ID to clear it later if needed
      this._refreshIntervalId = setInterval(function () {
        this._fetchConsumptionData();
      }.bind(this), 60000); // 60000 ms = 1 minute
    },
    onRefreshIconPress: function () {
      // this._fetchConsumptionData();
    },

    _fetchConsumptionData: function () {
      // var sUrl = 'https://dbapicall.cfapps.eu20-001.hana.ondemand.com/api/get/consumptionData';
      var sUrl = 'https://dbapicall.cfapps.eu20-001.hana.ondemand.com/api/get/realTimeConsumptionData';

      //Get the selected resource and create service payload
      var oPodSelectionModel = this.getPodSelectionModel(),
        oSelectedResource = oPodSelectionModel.stelSelectedResourceData;

      var oPayload = {
        plant: this.getPodController().getUserPlant(),
        order: oSelectedResource.customData.ORDER,
        operator: oSelectedResource.customData.OPERATOR,
        component: oSelectedResource.customData.MATERIAL,
        resource: oSelectedResource.resource,
        fromDateAndTime: new Date(Date.now() - 1000 * 60 * 30)
      };

      // Perform AJAX POST request
      $.ajax({
        url: sUrl,
        type: 'POST',
        contentType: 'application/json',
        data: JSON.stringify(oPayload),
        success: function (oResponseData) {
          // Log the response to debug its structure
          console.log(oResponseData);

          // Update the "data" model with the fetched data
          var oModel = this.getView().getModel('data');
          oModel.setProperty('/data', oResponseData);

          // Update the chart with the new data
          // this._updateChart();
          sap.m.MessageToast.show('Data successfully fetched and bound to the chart!');
          console.log("REALTIMECONSUMPTION_DATA", oResponseData);
        }.bind(this),
        error: function (oError) {
          console.error('Error in API call:', oError);
          sap.m.MessageBox.error('Failed to fetch data from the server. Please try again.');
        }
      });

    },

    onConsumeChartPress: function () {
      this._initCombineChart('timeseries_combination');
    },

    onTareChartPress: function () {
      this._initScatterChart('timeseries_scatter');
    },

    _initScatterChart: function (chartType) {
      var oView = this.getView(),
        oModel = this.getOwnerComponent().getModel('data'),
        oVizFrame = oView.byId('idVizFrame');

      oVizFrame.destroyDataset();
      oVizFrame.destroyFeeds();
      oVizFrame.setModel(oModel);

      //Set type of chart
      //timeseries_bullet
      oVizFrame.setVizType(chartType);

      //Set VizFrame data set
      var oDataSet = {
        dimensions: [
          {
            name: 'Date',
            value: '{data>Date}',
            dataType: 'date'
          }
        ],
        measures: [
          {
            name: 'Cost',
            value: '{data>Cost}'
          }
        ],
        data: {
          path: 'data>/data'
        }
      };
      var oDataset = new FlattenedDataset(oDataSet);
      oVizFrame.setDataset(oDataset);

      //Set VizFrame properties
      var oVizProperties = {
        plotArea: {
          window: {
            start: 'firstDataPoint',
            end: 'lastDataPoint'
          },
          dataLabel: {
            formatString: ChartFormatter.DefaultPattern.SHORTFLOAT_MFD2,
            visible: false
          }
        },
        valueAxis: {
          visible: true,
          label: {
            formatString: ChartFormatter.DefaultPattern.SHORTFLOAT
          },
          title: {
            visible: false
          }
        },
        valueAxis2: {
          visible: true,
          label: {
            formatString: ChartFormatter.DefaultPattern.SHORTFLOAT
          },
          title: {
            visible: false
          }
        },
        timeAxis: {
          title: {
            visible: false
          },
          interval: {
            unit: ''
          },
          levels: ['second', 'minute', 'hour', 'day', 'month', 'year']
        },
        title: {
          visible: false
        },
        interaction: {
          syncValueAxis: false
        }
      };
      oVizFrame.setVizProperties(oVizProperties);

      var feedTimeAxis = new FeedItem({
        uid: 'timeAxis',
        type: 'Dimension',
        values: ['Date']
      });

      var feedValueAxis = new FeedItem({
        uid: 'valueAxis',
        type: 'Measure',
        values: ['Cost']
      });

      // oVizFrame.addFeed(feedActualValues);
      // oVizFrame.addFeed(feedTargetValues);
      oVizFrame.addFeed(feedTimeAxis);
      oVizFrame.addFeed(feedValueAxis);

      var oPopOver = this.getView().byId('idPopOver');
      oPopOver.connect(oVizFrame.getVizUid());
      oPopOver.setFormatString({
        Date: 'dd/MM/yyyy hh:mm:ss'
      });
    },

    _initCombineChart: function (chartType) {
      var oView = this.getView(),
        oModel = this.getOwnerComponent().getModel('data'),
        oVizFrame = oView.byId('idVizFrame');

      oVizFrame.destroyDataset();
      oVizFrame.destroyFeeds();
      oVizFrame.setModel(oModel);

      //Set type of chart
      //timeseries_bullet
      oVizFrame.setVizType(chartType);

      //Set VizFrame data set
      var oDataSet = {
        dimensions: [
          {
            name: 'Date',
            value: '{data>Date}',
            dataType: 'date'
          }
        ],
        measures: [
          {
            name: 'Cost',
            value: '{data>Cost}'
          }, {
            name: 'Revenue',
            value: '{data>Revenue}'
          },
          {
            name: 'TargetUpper',
            value: '{data>UPPER_TOLERANCE}'
          },
          {
            name: 'TargetLower',
            value: '{data>LOWER_TOLERANCE}'
          },
          {
            name: 'FixedLimit',
            value: '{data>FixedLimit}'
          },
          {
            name: 'FixedLimit2',
            value: '{data>FixedLimit2}'
          },
          {
            name: 'FixedLimit3',
            value: '{data>FixedLimit3}'
          }
        ],
        data: {
          path: 'data>/data'
        }
      };
      var oDataset = new FlattenedDataset(oDataSet);
      oVizFrame.setDataset(oDataset);

      //Set VizFrame properties
      var oVizProperties = {
        plotArea: {
          window: {
            start: 'firstDataPoint',
            end: 'lastDataPoint'
          },
          dataLabel: {
            formatString: ChartFormatter.DefaultPattern.SHORTFLOAT_MFD2,
            visible: false
          }
        },
        valueAxis: {
          visible: true,
          title: {
            visible: false
          }
        },
        valueAxis2: {
          visible: true,
          title: {
            visible: false
          }
        },
        timeAxis: {
          title: {
            visible: false
          },
          interval: {
            unit: ''
          },
          levels: ['second', 'minute', 'hour', 'day', 'month', 'year']
        },
        title: {
          visible: false
        },
        interaction: {
          syncValueAxis: false
        }
      };
      oVizFrame.setVizProperties(oVizProperties);

      //Set data feeds for vizframe
      var feedTimeAxis = new FeedItem({
        uid: 'timeAxis',
        type: 'Dimension',
        values: ['Date']
      });

      var feedValueAxis = new FeedItem({
        uid: 'valueAxis',
        type: 'Measure',
        values: ['Revenue', 'Cost', 'TargetUpper', 'TargetLower', 'FixedLimit', 'FixedLimit2', 'FixedLimit3']
      });

      // oVizFrame.addFeed(feedActualValues);
      // oVizFrame.addFeed(feedTargetValues);
      oVizFrame.addFeed(feedTimeAxis);
      oVizFrame.addFeed(feedValueAxis);

      var oPopOver = this.getView().byId('idPopOver');
      oPopOver.connect(oVizFrame.getVizUid());
      oPopOver.setFormatString({
        Date: 'dd/MM/yyyy hh:mm:ss'
      });
    },

    _initChart: function () {
      var oView = this.getView(),
        oModel = this.getOwnerComponent().getModel('data'),
        oVizFrame = oView.byId('idVizFrame');

      oVizFrame.destroyDataset();
      oVizFrame.destroyFeeds();
      oVizFrame.setModel(oModel);

      //Set type of chart
      //timeseries_bullet
      oVizFrame.setVizType('timeseries_combination');

      //Set VizFrame data set
      var oDataSet = {
        dimensions: [
          {
            name: 'Date',
            value: '{data>CONSUMPTION_DATE}',
            dataType: 'date'
          }
        ],
        measures: [
          {
            name: 'Actual',
            value: '{data>QUANTITY}'
          },
          {
            name: 'TargetUpper',
            value: '{data>UPPER_TOLERANCE}'
          },
          {
            name: 'TargetLower',
            value: '{data>LOWER_TOLERANCE}'
          }
        ],
        data: {
          path: 'data>/data'
        }
      };
      var oDataset = new FlattenedDataset(oDataSet);
      oVizFrame.setDataset(oDataset);

      //Set VizFrame properties
      var oVizProperties = {
        plotArea: {
          window: {
            start: 'firstDataPoint',
            end: 'lastDataPoint'
          },
          dataLabel: {
            visible: false
          }
        },
        valueAxis: {
          visible: true,
          title: {
            visible: false
          }
        },
        valueAxis2: {
          visible: true,
          title: {
            visible: false
          }
        },
        timeAxis: {
          title: {
            visible: false
          },
          interval: {
            unit: ''
          },
          levels: ['second', 'minute', 'hour', 'day', 'month', 'year']
        },
        title: {
          visible: false
        },
        interaction: {
          syncValueAxis: false
        }
      };
      oVizFrame.setVizProperties(oVizProperties);

      //Set data feeds for vizframe
      var feedActualValues = new FeedItem({
        uid: 'actualValues',
        type: 'Measure',
        values: ['Actual', 'TargetUpper']
      });

      var feedTargetValues = new FeedItem({
        uid: 'targetValues',
        type: 'Measure',
        values: ['TargetUpper', 'TargetLower']
      });

      var feedTimeAxis = new FeedItem({
        uid: 'timeAxis',
        type: 'Dimension',
        values: ['Date']
      });

      var feedValueAxis = new FeedItem({
        uid: 'valueAxis',
        type: 'Measure',
        values: ['Actual', 'TargetUpper', 'TargetLower']
      });

      // oVizFrame.addFeed(feedActualValues);
      // oVizFrame.addFeed(feedTargetValues);
      oVizFrame.addFeed(feedTimeAxis);
      oVizFrame.addFeed(feedValueAxis);

      var oPopOver = this.getView().byId('idPopOver');
      oPopOver.connect(oVizFrame.getVizUid());
      oPopOver.setFormatString({
        Date: 'dd/MM/yyyy hh:mm:ss'
      });
    },

    onback: function (oEvent) {
      this.navigateToMainPage();
    },
    onBackButtonPress: function (oEvent) {
      this.navigateToMainPage();
    },

    onAfterRendering: function () {
      // this.getView().byId("backButton").setVisible(this.getConfiguration().backButtonVisible);
      // this.getView().byId("closeButton").setVisible(this.getConfiguration().closeButtonVisible);
      // this.getView().byId("headerTitle").setText(this.getConfiguration().title);
      // this.getView().byId("textPlugin").setText(this.getConfiguration().text);
    },

    onBeforeRenderingPlugin: function () {
      this.subscribe('PageChangeEvent', this.onPageChangeEvent, this);
    },

    isSubscribingToNotifications: function () {
      var bNotificationsEnabled = true;

      return bNotificationsEnabled;
    },

    getCustomNotificationEvents: function (sTopic) {
      //return ["template"];
    },

    getNotificationMessageHandler: function (sTopic) {
      //if (sTopic === "template") {
      //    return this._handleNotificationMessage;
      //}
      return null;
    },

    _handleNotificationMessage: function (oMsg) {
      var sMessage = "Message not found in payload 'message' property";
      if (oMsg && oMsg.parameters && oMsg.parameters.length > 0) {
        for (var i = 0; i < oMsg.parameters.length; i++) {
          switch (oMsg.parameters[i].name) {
            case 'template':
              break;
            case 'template2':
          }
        }
      }
    },

    onExit: function () {
      // Clear the interval when exiting the view
      if (this._refreshIntervalId) {
        clearInterval(this._refreshIntervalId);
      }
      PluginViewController.prototype.onExit.apply(this, arguments);

      this.unsubscribe('PageChangeEvent', this.onPageChangeEvent, this);
    },

    onPageChangeEvent: function (sChannelId, sEventId, oData) {
      if (oData.page == 'CHARTPAGE') {
        // this._fetchConsumptionData();
      }
    }
  });
}
);
