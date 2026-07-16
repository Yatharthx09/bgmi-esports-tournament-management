from flask import Blueprint
from flask_jwt_extended import jwt_required, get_jwt_identity

from app import db
from app.models.notification import Notification
from app.utils.responses import success, error

notifications_bp = Blueprint("notifications", __name__)


@notifications_bp.route("", methods=["GET"])
@jwt_required()
def list_notifications():
    user_id = int(get_jwt_identity())
    notifs = Notification.query.filter_by(user_id=user_id).order_by(Notification.created_at.desc()).all()
    return success({
        "notifications": [n.to_dict() for n in notifs],
        "unread_count": len([n for n in notifs if not n.is_read]),
    })


@notifications_bp.route("/<int:notif_id>/read", methods=["PATCH"])
@jwt_required()
def mark_read(notif_id):
    notif = Notification.query.get(notif_id)
    if not notif:
        return error("Notification not found", 404)
    notif.is_read = True
    db.session.commit()
    return success({"notification": notif.to_dict()})


@notifications_bp.route("/read-all", methods=["PATCH"])
@jwt_required()
def mark_all_read():
    user_id = int(get_jwt_identity())
    Notification.query.filter_by(user_id=user_id, is_read=False).update({"is_read": True})
    db.session.commit()
    return success(None, "All notifications marked as read")
