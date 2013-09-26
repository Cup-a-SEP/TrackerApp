<?
//This file parses the git commit messages and adds them as version history details to the files that were edited in that commit.


//Change directory to the git repo
chdir('/Users/jeroen/Documents/Aptana Studio 3 Workspace/project');

//Get the log. TODO: add log starting point option
$gitlog = shell_exec('git log --oneline');

//Commit counter
$n = 0;

//Tokenize log by endlines
$line = strtok($gitlog, PHP_EOL);

//This is needed later to format the dates.
$commitdate = new DateTime ('NOW', new DateTimeZone("Europe/Amsterdam"));

//This will store the version data for each file for which one exists.
$version_data = array();

//Loop over each different git commit.
while ($line !== false) {

	//Split the line into the commit hash code, and the commit message
	$commitcode = mb_substr($line, 0, 7);
	$commitmessage = mb_substr($line, 8);
	$n++;

	//Get details: author and timestamp
	$commitdeets = shell_exec('git show -s --format=%cn%n%ct ' . $commitcode);
	list($author, $timestamp, $trash) = explode(PHP_EOL, $commitdeets);
	
	//Format this data into a string that will be added to each file in this commit
	$commitdate->setTimestamp($timestamp);
	$commit_log_string = ' *  [' . $commitcode . '] ' . $commitdate->format('Y-m-d') . ' by ' . ucfirst($author) . ': ' . ucfirst($commitmessage) . "\n";
	//echo $commit_log_string;
	//Get the list of files modified in this commit and iterate
	$commitfiles = shell_exec('git diff-tree --no-commit-id --name-status -r ' . $commitcode);
	$commitfilea = explode(PHP_EOL, $commitfiles);
	array_pop($commitfilea);
	foreach ($commitfilea as $commitfile) {

		//Split the line into action and path, we only use path (I think).
		$commit_file_action = mb_substr($commitfile, 0, 1);	
		$commit_file_path = mb_substr($commitfile, 2);	
	
		//Add the commit log string to this file
		if (isset($version_data[$commit_file_path])) {
			$version_data[$commit_file_path] .= $commit_log_string;
		} else {
			$version_data[$commit_file_path] = $commit_log_string;
		}
	}

	//Continue loop of git commits
	$line = strtok(PHP_EOL);
}

//var_dump($version_data);


foreach ($version_data as $filename => $file) {
echo $filename . "\n" . $file . "\n\n";
}