# 1. Milestone 1

### Dataset


* We will be working on a chess dataset found on Kaggle and extracted from Lichess (an online, open-source chess playing website): https://www.kaggle.com/datasnaek/chess
This dataset regroups 20,000 games played on the website and we will be interested in the following information:
  * Turns: the number of turns in the game
  * Victory_status: out_of_time, resigned, mate
  * Winner: black, white or draw
  * Time increment: the total allocated time for the game (for example 10 minutes total for each player + 5 second increment at each turn)
  * White player rating: according to the ELO rating on Lichess
  * Black player ratings
  * All moves: all moves during the game in standard chess notation
  * Opening name
  * Opening ply: number of moves during the opening

We plan on making small data wrangling steps to extract information on the different openings, the different trajectories of certain pieces and statistics of games according to the players ratings.

* We also plan to incorporate some facts about the current top players in the world, by using data provided by the International Chess Federation: http://ratings.fide.com/toplist.phtml



### Problematic

* Our visualization wants to present the game of chess to beginners and experienced players in an intuitive and playful, yet educative way. One part will be dedicated to teaching the basic rules with examples and another for exploring chess theory and how it comes into play at different player levels and in different games. We want the user to be able to explore different facets of a chess game and see how the theory and the 20,000 games we analyze work together.

### Exploratory Data Analysis

> Pre-processing of the data set you chose
> - Show some basic statistics and get insights about the data

### Related work

* The websites chess.com and Lichess provide some visualizations for openings that inspires us to do our own. For example: https://www.chess.com/openings/Ruy-Lopez-Opening
* We have found inspiration in the following visualization: *insérer notre image* for visualizing the different trajectories of a chess piece during all 20,000 games.
> - What others have already done with the data?
> - Why is your approach original?
> - What source of inspiration do you take? Visualizations that you found on other websites or magazines (might be unrelated to your data).
> - In case you are using a dataset that you have already explored in another context (ML or ADA course, semester project...), you are required to share the report of that work to outline the differences with the submission for this class.
