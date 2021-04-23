# Project of Data Visualization (COM-480)

| Student's name | SCIPER |
| -------------- | ------ |
| Luã Streit | 258892 |
| Marie Reignier-Tayar| 274122 |
| Damien Gengler | 272798 |

[Milestone 1](#milestone-1) • [Milestone 2](#milestone-2) • [Milestone 3](#milestone-3)

## Milestone 1 (23rd April, 5pm)

**10% of the final grade**

This is a preliminary milestone to let you set up goals for your final project and assess the feasibility of your ideas.
Please, fill the following sections about your project.

*(max. 2000 characters per section)*

### Dataset

We will be working on a chess dataset found on Kaggle and extracted from Lichess (an online, open-source chess playing website): https://www.kaggle.com/datasnaek/chess

This dataset contains around 20,000 games played on the website and we will be interested in the following information:
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

We also plan to incorporate some facts about the current top players in the world, by using data provided by the International Chess Federation: http://ratings.fide.com/toplist.phtml


### Problematic

Our visualization wants to present the game of chess to beginners and experienced players in an intuitive and playful, yet educative way.
One part will be dedicated to teaching the basic rules with examples and another for exploring chess theory and how it comes into play at different player levels and in different games.
We want the user to be able to explore different facets of a chess game and see how the theory and the 20,000 games we analyze work together.

### Exploratory Data Analysis

The data set contains a lot of interesting information.

We have extracted the most common opening names, and the frequency of their different variations.
We have also built heatmaps of positions in order to get a feel of where some pieces end the game.

### Related work

* The websites chess.com and Lichess provide some visualizations for openings that inspire us to do our own. For example: https://www.chess.com/openings/Ruy-Lopez-Opening
* We have found inspiration in the following visualization: http://www.turbulence.org/spotlight/thinking/opening-viz.jpg for visualizing the different trajectories of a chess piece during all 20,000 games.


## Milestone 2 (7th May, 5pm)

**10% of the final grade**


## Milestone 3 (4th June, 5pm)

**80% of the final grade**


## Late policy

- < 24h: 80% of the grade for the milestone
- < 48h: 70% of the grade for the milestone

