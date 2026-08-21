-- CreateIndex
CREATE INDEX "VenueInvite_venueId_idx" ON "VenueInvite"("venueId");

-- CreateIndex
CREATE UNIQUE INDEX "MediaItem_videoId_key" ON "MediaItem"("videoId");

-- CreateIndex
CREATE INDEX "QueueItem_venueId_position_idx" ON "QueueItem"("venueId", "position");

-- CreateIndex
CREATE INDEX "QueueItem_venueId_status_idx" ON "QueueItem"("venueId", "status");

-- CreateIndex
CREATE INDEX "QueueItem_venueId_mediaId_idx" ON "QueueItem"("venueId", "mediaId");

-- CreateIndex
CREATE INDEX "SongRequest_venueId_status_idx" ON "SongRequest"("venueId", "status");
