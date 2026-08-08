-- CreateIndex
CREATE INDEX "books_categoryId_idx" ON "books"("categoryId");

-- CreateIndex
CREATE INDEX "books_isPublished_createdAt_idx" ON "books"("isPublished", "createdAt");

-- CreateIndex
CREATE INDEX "books_isPublished_viewCount_idx" ON "books"("isPublished", "viewCount");

-- CreateIndex
CREATE INDEX "logs_userId_idx" ON "logs"("userId");

-- CreateIndex
CREATE INDEX "logs_createdAt_idx" ON "logs"("createdAt");

-- CreateIndex
CREATE INDEX "notifications_userId_read_idx" ON "notifications"("userId", "read");

-- CreateIndex
CREATE INDEX "reading_history_userId_idx" ON "reading_history"("userId");

-- CreateIndex
CREATE INDEX "reading_history_bookId_idx" ON "reading_history"("bookId");

-- CreateIndex
CREATE INDEX "reading_history_accessedAt_idx" ON "reading_history"("accessedAt");

-- CreateIndex
CREATE INDEX "reviews_status_createdAt_idx" ON "reviews"("status", "createdAt");

-- CreateIndex
CREATE INDEX "tccs_categoryId_idx" ON "tccs"("categoryId");

-- CreateIndex
CREATE INDEX "tccs_authorId_idx" ON "tccs"("authorId");

-- CreateIndex
CREATE INDEX "tccs_advisorId_idx" ON "tccs"("advisorId");

-- CreateIndex
CREATE INDEX "tccs_isPublished_year_idx" ON "tccs"("isPublished", "year");

-- CreateIndex
CREATE INDEX "tccs_isPublished_viewCount_idx" ON "tccs"("isPublished", "viewCount");
