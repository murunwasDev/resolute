import React from "react";
import CardActions from "@mui/material/CardActions";
import CardContent from "@mui/material/CardContent";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { getDaysLeft } from "../../../utils/datetime";
import Tooltip from "@mui/material/Tooltip";
import { Paper } from "@mui/material";
import { computeVotingPercentage, formatVoteOption } from "../../../utils/proposals";

export const ProposalItem = (props) => {
  const { info, vote, onItemClick, tally } = props;
  const tallyInfo = computeVotingPercentage(tally, false);
  const { yes, no, noWithVeto, abstain } = tallyInfo;
  const tallySum =
    Number(yes) + Number(no) + Number(noWithVeto) + Number(abstain);

  const tallySumInfo = {
    yes: (tallyInfo.yes / tallySum) * 100,
    no: (tallyInfo.no / tallySum) * 100,
    no_with_veto: (tallyInfo.noWithVeto / tallySum) * 100,
    abstain: (tallyInfo.abstain / tallySum) * 100,
  };
  const onVoteClick = () => {
    props.setOpen(info?.proposal_id);
  };


  return (
    <Paper
      elevation={0}
      sx={{
        p: 1,
      }}
    >
      <CardContent>
        <div
          style={{
            display: "flex",
            flexDirection: "row",
          }}
          onClick={() => onItemClick()}
        >
          <Typography
            sx={{ cursor: "pointer" }}
            color="text.primary"
            fontWeight={600}
            variant="body1"
            gutterBottom
          >
            #{info.proposal_id}
          </Typography>
          <Typography
            variant="body1"
            component="div"
            color="text.primary"
            className="proposal-title"
            onClick={() => onItemClick()}
            gutterBottom
            fontWeight={600}
            sx={{ cursor: "pointer", ml: 1 }}
          >
            {info.content?.title || info.content?.["@type"]}
          </Typography>
        </div>

        <div style={{ display: "flex", alignItems: "center" }}>
          <Typography variant="body1">Voting ends in &nbsp;</Typography>
          <Typography variant="body1">
            {getDaysLeft(info?.voting_end_time) === 1 ? `1 day` : `${getDaysLeft(info?.voting_end_time)} days`}
          </Typography>
        </div>

        <Box
          sx={{
            mt: 1,
          }}
          style={{
            display: "flex",
            flexDirection: "row",
            justifyContent: "space-between",
          }}
        >
          <Tooltip title={`Yes ${tallyInfo.yes}%`} placement="top">
            <Box
              sx={{
                width: `${tallySumInfo.yes}%`,
                margin: "0 0.5px",
                backgroundColor: "#18a572",
                height: "3px",
              }}
            ></Box>
          </Tooltip>
          <Tooltip title={`No ${tallyInfo.no}%`} placement="top">
            <Box
              sx={{
                width: `${tallySumInfo.no}%`,
                margin: "0 0.5px",
                backgroundColor: "#ce4256",
                height: "3px",
              }}
            ></Box>
          </Tooltip>
          <Tooltip title={`Veto ${tallyInfo.noWithVeto}%`} placement="top">
            <Box
              sx={{
                width: `${tallySumInfo.no_with_veto}%`,
                margin: "0 0.5px",
                backgroundColor: "#ce4256",
                height: "3px",
              }}
            ></Box>
          </Tooltip>
          <Tooltip title={`Abstain ${tallyInfo.abstain}%`} placement="top">
            <Box
              sx={{
                width: `${tallySumInfo.abstain}%`,
                margin: "0 0.5px",
                backgroundColor: "primary.main",
                height: "3px",
              }}
            ></Box>
          </Tooltip>
        </Box>
      </CardContent>
      <CardActions style={{ display: "flex", justifyContent: "space-between" }}>
        {vote?.vote?.proposal_id ? (
          <Typography variant="body2" color="text.primary">
            You voted {formatVoteOption(vote?.vote?.option)}
          </Typography>
        ) : (
          <>&nbsp;</>
        )}
        <Button
          size="small"
          variant="contained"
          disableElevation
          onClick={onVoteClick}
        >
          Vote
        </Button>
      </CardActions>
    </Paper>
  );
};