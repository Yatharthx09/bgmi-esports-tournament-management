import csv
import io


def leaderboard_to_csv(entries):
    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow([
        "Rank", "Team", "Matches Played", "Placement Points", "Finish Points",
        "Total Points", "Chicken Dinners", "Total Finishes", "Average Placement",
    ])
    for e in entries:
        writer.writerow([
            e.rank, e.team.name if e.team else "", e.matches_played, e.placement_points,
            e.finish_points, e.total_points, e.chicken_dinners, e.total_finishes,
            round(e.average_placement, 2) if e.average_placement else 0,
        ])
    return output.getvalue()
