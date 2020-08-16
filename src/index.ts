import dotenv from 'dotenv';
import { Todoist as TodoistV8Api } from 'todoist';
// import cron from 'node-cron';

import { TodoistActivityLog } from './types/TodoistEvent';

dotenv.config();

const todoistApiToken = process.env.TODOIST_API_TOKEN;
if (!todoistApiToken) {
  throw new Error('Todoist API token not defined in .env');
}

if (!process.env.TODOIST_USER_ID) {
  throw new Error('Todoist User ID not defined in .env');
}

const todoistUserId = parseInt(process.env.TODOIST_USER_ID, 10);

const todoist = TodoistV8Api(todoistApiToken);

// Run every minute.
// cron.schedule('* 1 * * * *', async () => {});

(async () => {
  await todoist.sync();

  // TODO: Submit upstream PR; typings for `activityLog` are incorrect.
  // Also, why is 'endpoint' necessary??
  const activityLog = ((await todoist.activityLog.get({
    endpoint: 'https://api.todoist.com/sync/v8',
    event_type: 'completed',
    object_type: 'item',
    page: 0,
  })) as unknown) as TodoistActivityLog;

  const recentlyCompletedItemEvents = activityLog.events;

  const completedByMeSorted = recentlyCompletedItemEvents
    // Items completed by me.
    // TODO May want to include tasks completed by others, in the event I've
    // left comments on them.
    .filter(
      (event) =>
        event.initiator_id === todoistUserId || event.initiator_id === null,
    )
    .sort((taskA, taskB) => {
      const now = new Date().valueOf();

      const taskADateCompleted = taskA.event_date
        ? Date.parse(taskA.event_date)
        : now;

      const taskBDateCompleted = taskB.event_date
        ? Date.parse(taskB.event_date)
        : now;

      return taskBDateCompleted - taskADateCompleted;
    });

  const completedTaskDescriptions = completedByMeSorted.map(
    (item) => item.extra_data?.content,
  );

  console.log(completedTaskDescriptions.join('\n'));
})();
