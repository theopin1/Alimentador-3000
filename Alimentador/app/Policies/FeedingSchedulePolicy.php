<?php

namespace App\Policies;

use App\Models\FeedingSchedule;
use App\Models\User;

class FeedingSchedulePolicy
{
    public function view(User $user, FeedingSchedule $schedule): bool
    {
        return $user->id === $schedule->device->user_id;
    }

    public function update(User $user, FeedingSchedule $schedule): bool
    {
        return $user->id === $schedule->device->user_id;
    }

    public function delete(User $user, FeedingSchedule $schedule): bool
    {
        return $user->id === $schedule->device->user_id;
    }
}
