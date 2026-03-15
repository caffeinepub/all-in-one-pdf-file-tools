import Set "mo:core/Set";
import Text "mo:core/Text";
import Time "mo:core/Time";
import Map "mo:core/Map";
import Int "mo:core/Int";
import Array "mo:core/Array";
import Order "mo:core/Order";

actor {
  type ToolUsage = {
    toolName : Text;
    timestamp : Time.Time;
  };

  module ToolUsage {
    public func compare(a : ToolUsage, b : ToolUsage) : Order.Order {
      switch (Text.compare(a.toolName, b.toolName)) {
        case (#equal) { Int.compare(a.timestamp, b.timestamp) };
	      case (order) { order };
      };
    };
  };

  let preferences = Set.empty<Text>();
  let usageHistory = Map.empty<Text, ToolUsage>();

  public shared ({ caller }) func togglePreference(pref : Text) : async () {
    if (preferences.contains(pref)) {
      preferences.remove(pref);
    } else {
      preferences.add(pref);
    };
  };

  public query ({ caller }) func hasPreference(pref : Text) : async Bool {
    preferences.contains(pref);
  };

  public shared ({ caller }) func logToolUsage(toolName : Text) : async () {
    let entry : ToolUsage = {
      toolName;
      timestamp = Time.now();
    };
    usageHistory.add(toolName, entry);
  };

  public query ({ caller }) func getAllPreferences() : async [Text] {
    preferences.toArray();
  };

  public query ({ caller }) func getHistory() : async [ToolUsage] {
    usageHistory.values().toArray().sort();
  };
};
