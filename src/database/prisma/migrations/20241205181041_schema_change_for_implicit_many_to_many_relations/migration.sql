-- AlterTable
ALTER TABLE "_article_likes" ADD CONSTRAINT "_article_likes_AB_pkey" PRIMARY KEY ("A", "B");

-- DropIndex
DROP INDEX "_article_likes_AB_unique";

-- AlterTable
ALTER TABLE "_article_tags" ADD CONSTRAINT "_article_tags_AB_pkey" PRIMARY KEY ("A", "B");

-- DropIndex
DROP INDEX "_article_tags_AB_unique";

-- AlterTable
ALTER TABLE "_booking_requests_bookables" ADD CONSTRAINT "_booking_requests_bookables_AB_pkey" PRIMARY KEY ("A", "B");

-- DropIndex
DROP INDEX "_booking_requests_bookables_AB_unique";

-- AlterTable
ALTER TABLE "_event_going" ADD CONSTRAINT "_event_going_AB_pkey" PRIMARY KEY ("A", "B");

-- DropIndex
DROP INDEX "_event_going_AB_unique";

-- AlterTable
ALTER TABLE "_event_interested" ADD CONSTRAINT "_event_interested_AB_pkey" PRIMARY KEY ("A", "B");

-- DropIndex
DROP INDEX "_event_interested_AB_unique";

-- AlterTable
ALTER TABLE "_event_tags" ADD CONSTRAINT "_event_tags_AB_pkey" PRIMARY KEY ("A", "B");

-- DropIndex
DROP INDEX "_event_tags_AB_unique";

-- AlterTable
ALTER TABLE "_member_tag_subscriptions" ADD CONSTRAINT "_member_tag_subscriptions_AB_pkey" PRIMARY KEY ("A", "B");

-- DropIndex
DROP INDEX "_member_tag_subscriptions_AB_unique";
