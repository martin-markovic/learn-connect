import Event from "../../../models/socket/eventModel.js";

const deleteEventForUser = async (userId, eventName, payload) => {
  try {
    await Event.findOneAndDelete({
      user: userId,
      eventName,
      payload,
    });
    console.log(`Event document for ${eventName} successfully deleted.`);
  } catch (error) {
    console.error(
      `Failed to delete event document for ${eventName}: ${error.message}`
    );
  }
};

export default deleteEventForUser;
