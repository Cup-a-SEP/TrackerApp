package com.phonegap.hello_world;

import java.text.SimpleDateFormat;
import java.util.Date;

import org.json.JSONException;
import org.json.JSONObject;

import android.util.Log;

import com.red_folder.phonegap.plugin.backgroundservice.BackgroundService;
import org.apache.cordova.statusBarNotification.StatusNotificationIntent;

import java.lang.NumberFormatException;

//Stuff for SBN

import android.app.Notification;
import android.app.NotificationManager;
import android.content.Context;
import android.content.Intent;
import org.json.JSONArray;



public class FritsService extends BackgroundService {
	
	//Needed for system log
	private final static String TAG = FritsService.class.getSimpleName();
	
	private long mNextAlarmTimestamp = 0;
	private String mSBNTitle = "Frits Alarm";
	private String mSBNBody = "Frits alarm gaat af!";
	

	@Override
	protected JSONObject doWork() {
		JSONObject result = new JSONObject();
		
		try {
			long now = System.currentTimeMillis() / 1000;

			long timetoalarm = mNextAlarmTimestamp - now;
			String msg = "Alarm is set in " + String.valueOf(timetoalarm) + " seconds. (" + String.valueOf(mNextAlarmTimestamp) + ", " + String.valueOf(now) + ")";
			result.put("Message", msg);

			Log.d(TAG, msg);
						
			//showNotification(TAG, "title", "body", 1);

		} catch (JSONException e) {
		}
		
		return result;	
	}

	@Override
	protected JSONObject getConfig() {
		JSONObject result = new JSONObject();
		
		try {
			result.put("NextAlarmTimestamp", String.valueOf(this.mNextAlarmTimestamp));
		} catch (JSONException e) {
		}
		
		return result;
	}

	@Override
	protected void setConfig(JSONObject config) {
		try {
			Log.d(TAG, config.getString("NextAlarmTimestamp"));
			
			if (config.has("NextAlarmTimestamp")) this.mNextAlarmTimestamp = Long.valueOf(config.getString("NextAlarmTimestamp").substring(0,10));
			
			Log.d(TAG, String.valueOf(mNextAlarmTimestamp));
			
			long now = System.currentTimeMillis() / 1000;

			long timetoalarm = mNextAlarmTimestamp - now;
			String msg = "Alarm is set in " + String.valueOf(timetoalarm) + " seconds. (" + String.valueOf(mNextAlarmTimestamp) + ", " + String.valueOf(now) + ")";

			Log.d(TAG, msg);
		} catch (JSONException e) {
		} catch (NumberFormatException e) {
			Log.d(TAG, "NFE");
		}
		
	}     

	@Override
	protected JSONObject initialiseLatestResult() {
		// TODO Auto-generated method stub
		return null;
	}

	@Override
	protected void onTimerEnabled() {
		// TODO Auto-generated method stub
		
	}

	@Override
	protected void onTimerDisabled() {
		// TODO Auto-generated method stub
		
	}

  //	Action to execute
  public static final String NOTIFY = "notify";
  public static final String CLEAR = "clear";

  /**
   * 	Executes the request and returns PluginResult
   *
   * 	@param action		Action to execute
   * 	@param data			JSONArray of arguments to the plugin
   *  @param callbackContext	The callback context used when calling back into JavaScript.
   *
   *  @return				A PluginRequest object with a status
   * */
  /*public boolean execute(String action, JSONArray data, CallbackContext callbackContext) {
      boolean actionValid = true;
      if (NOTIFY.equals(action)) {
          try {
              String tag = data.getString(0);
              String title = data.getString(1);
              String body = data.getString(2);
              String flag = data.getString(3);
              int notificationFlag = getFlagValue(flag);
              Log.d("NotificationPlugin", "Notification: " + tag + ", " + title + ", " + body + ", " + notificationFlag);
              showNotification(tag, title, body, notificationFlag);
          } catch (JSONException jsonEx) {
              Log.d("NotificationPlugin", "Got JSON Exception "
                      + jsonEx.getMessage());
              actionValid = false;
          }
      } else if (CLEAR.equals(action)){
          try {
              String tag = data.getString(0);
              Log.d("NotificationPlugin", "Notification cancel: " + tag);
              clearNotification(tag);
          } catch (JSONException jsonEx) {
              Log.d("NotificationPlugin", "Got JSON Exception " + jsonEx.getMessage());
              actionValid = false;
          }
      } else {
          actionValid = false;
          Log.d("NotificationPlugin", "Invalid action : "+action+" passed");
      }
      return actionValid;
    }*/

    /**
     * Helper method that returns a flag value to be used for notification
     * by default it will return 16 representing FLAG_NO_CLEAR
     * 
     * @param flag
     * @return int value of the flag
     */
    private int getFlagValue(String flag) {
		int flagVal = Notification.FLAG_AUTO_CANCEL;
		
		// We trust the flag value as it comes from our JS constant.
		// This is also backwards compatible as it will be emtpy.
		if (!flag.isEmpty()){
			flagVal = Integer.parseInt(flag);
		}
		
		return flagVal;
	}

	/**
   * 	Displays status bar notification
   *
   * 	@param tag Notification tag.
   *  @param contentTitle	Notification title
   *  @param contentText	Notification text
   **/
  public void showNotification( CharSequence tag, CharSequence contentTitle, CharSequence contentText, int flag) {
      String ns = Context.NOTIFICATION_SERVICE;
      context = getApplicationContext();
      mNotificationManager = (NotificationManager) context.getSystemService(ns);

      Notification noti = StatusNotificationIntent.buildNotification(context, tag, contentTitle, contentText, flag);
      mNotificationManager.notify(tag.hashCode(), noti);
  }

  /**
   * Cancels a single notification by tag.
   *
   * @param tag Notification tag to cancel.
   */
  public void clearNotification(String tag) {
      mNotificationManager.cancel(tag.hashCode());
  }

  /**
   * Removes all Notifications from the status bar.
   */
  public void clearAllNotifications() {
      mNotificationManager.cancelAll();
  }

  /**
   * Called when a notification is clicked.
   * @param intent The new Intent passed from the notification.
   */
  /*public void onNewIntent(Intent intent) {
      // The incoming Intent may or may not have been for a notification.
      String tag = intent.getStringExtra("notificationTag");
      if (tag != null) {
      	 this.webView.sendJavascript("window.Notification.callOnclickByTag('"+ tag + "')");
      }
  }*/


  private NotificationManager mNotificationManager;
  private Context context;
}
